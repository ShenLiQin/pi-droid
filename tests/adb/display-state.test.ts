import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/adb/exec.js", () => ({
  adbShell: vi.fn(async () => ""),
  adb: vi.fn(async () => ""),
  getForegroundPackage: vi.fn(async () => ""),
}));

import { adbShell } from "../../src/adb/exec.js";
import {
  KEYGUARD_STATE_CMD,
  parseDensity,
  parseKeyboardVisible,
  parseLocked,
  parseScreenOn,
  parseScreenOnDump,
  readDisplayState,
} from "../../src/adb/display-state.js";

const mockAdbShell = vi.mocked(adbShell);

beforeEach(() => {
  vi.clearAllMocks();
});

// ── parseScreenOn ───────────────────────────────────────────────────

describe("parseScreenOn()", () => {
  it("reads the modern dumpsys display fields", () => {
    expect(parseScreenOn({ displayDump: "  Display State=ON\n    mScreenState=ON" })).toBe(true);
    expect(parseScreenOn({ displayDump: "  Display State=OFF\n    mScreenState=OFF" })).toBe(false);
  });

  it("falls back to the legacy `Display Power: state=` output", () => {
    expect(parseScreenOn({ powerDump: "  Display Power: state=ON" })).toBe(true);
    expect(parseScreenOn({ powerDump: "  Display Power: state=OFF" })).toBe(false);
  });

  it("falls back to mScreenOn and then wakefulness", () => {
    expect(parseScreenOn({ powerDump: "  mScreenOn=true" })).toBe(true);
    expect(parseScreenOn({ powerDump: "  mScreenOn=false" })).toBe(false);
    expect(parseScreenOn({ powerDump: "  mWakefulness=Awake" })).toBe(true);
    expect(parseScreenOn({ powerDump: "  mWakefulness=Dozing" })).toBe(false);
  });

  it("does not misread the modern object-reference Display Power line", () => {
    // Android 13+ prints an object reference here, not "state=ON".
    expect(
      parseScreenOn({
        displayDump: "  Display State=OFF\n    mScreenState=OFF",
        powerDump: "Display Power: com.android.server.power.PowerManagerService$1@a9e846a",
      }),
    ).toBe(false);
  });

  it("returns false when nothing matches", () => {
    expect(parseScreenOn()).toBe(false);
  });

  it("parses a single combined display+power dump", () => {
    expect(parseScreenOnDump("  mScreenState=ON")).toBe(true);
    expect(parseScreenOnDump("  mScreenState=OFF")).toBe(false);
    expect(parseScreenOnDump("  Display Power: state=ON")).toBe(true);
    expect(parseScreenOnDump("")).toBe(false);
  });
});

// ── parseLocked ─────────────────────────────────────────────────────

describe("parseLocked()", () => {
  it("reads the modern KeyguardServiceDelegate showing flag", () => {
    expect(parseLocked({ keyguardDump: "  KeyguardServiceDelegate\n    showing=true" })).toBe(true);
    expect(parseLocked({ keyguardDump: "  KeyguardServiceDelegate\n    showing=false" })).toBe(
      false,
    );
  });

  it("reads isKeyguardShowing / mKeyguardShowing", () => {
    expect(parseLocked({ keyguardDump: "  isKeyguardShowing=true" })).toBe(true);
    expect(parseLocked({ keyguardDump: "  mKeyguardShowing=true" })).toBe(true);
  });

  it("reads the legacy window flags", () => {
    expect(parseLocked({ keyguardDump: "  mDreamingLockscreen=true" })).toBe(true);
    expect(parseLocked({ keyguardDump: "  isStatusBarKeyguard=true" })).toBe(true);
    expect(parseLocked({ keyguardDump: "  mShowingLockscreen=true" })).toBe(true);
  });

  it("does not treat other *_Showing=false lines as locked", () => {
    expect(parseLocked({ keyguardDump: "  mShowingDream=false\n  mIsImeShowing=false" })).toBe(
      false,
    );
  });

  it("returns false when nothing matches", () => {
    expect(parseLocked()).toBe(false);
  });
});

// ── parseKeyboardVisible ────────────────────────────────────────────

describe("parseKeyboardVisible()", () => {
  it("reads mInputShown and the mIsImeShowing fallback", () => {
    expect(parseKeyboardVisible("  mInputShown=true")).toBe(true);
    expect(parseKeyboardVisible("  mInputShown=false")).toBe(false);
    expect(parseKeyboardVisible("  mIsImeShowing=true")).toBe(true);
    expect(parseKeyboardVisible("")).toBe(false);
  });
});

// ── parseDensity ────────────────────────────────────────────────────

describe("parseDensity()", () => {
  it("prefers the wm density override then physical density", () => {
    expect(parseDensity("Physical density: 320\nOverride density: 240")).toBe(240);
    expect(parseDensity("Physical density: 320")).toBe(320);
  });

  it("falls back to window display info", () => {
    expect(parseDensity("", "  mBaseDisplayDensity=560")).toBe(560);
    expect(parseDensity("", "  init=720x1280 320dpi mMinSizeOfResizeableTaskDp=220")).toBe(320);
  });

  it("returns 0 when unknown", () => {
    expect(parseDensity()).toBe(0);
    expect(parseDensity("", "")).toBe(0);
  });
});

// ── readDisplayState ────────────────────────────────────────────────

describe("readDisplayState()", () => {
  it("issues the display/power/keyguard probes in parallel", async () => {
    mockAdbShell.mockImplementation(async (cmd: string) => {
      if (cmd.includes("dumpsys display")) return "  mScreenState=ON";
      if (cmd.includes("dumpsys power")) return "  mWakefulness=Awake";
      if (cmd.includes("dumpsys window")) return "    showing=true";
      return "";
    });

    const state = await readDisplayState({ serial: "ABC" });

    expect(state.displayDump).toContain("mScreenState=ON");
    expect(state.powerDump).toContain("mWakefulness=Awake");
    expect(state.keyguardDump).toContain("showing=true");
    expect(mockAdbShell).toHaveBeenCalledTimes(3);
    expect(mockAdbShell).toHaveBeenCalledWith(KEYGUARD_STATE_CMD, { serial: "ABC" });
  });

  it("degrades to empty strings when a probe fails", async () => {
    mockAdbShell.mockRejectedValue(new Error("adb down"));
    const state = await readDisplayState();
    expect(state).toEqual({ displayDump: "", powerDump: "", keyguardDump: "" });
  });
});
