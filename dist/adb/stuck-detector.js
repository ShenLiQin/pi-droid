import { createHash } from "node:crypto";
const DEFAULT_SCREEN_REPEAT_THRESHOLD = 3;
const DEFAULT_ACTION_REPEAT_THRESHOLD = 3;
const DEFAULT_ACTION_WINDOW_SIZE = 10;
export class DefaultStuckDetector {
    options;
    actionWindow = [];
    lastScreenHash = null;
    sameScreenCount = 0;
    state = { stuck: false, count: 0 };
    constructor(options = {}) {
        this.options = {
            screenRepeatThreshold: options.screenRepeatThreshold ?? DEFAULT_SCREEN_REPEAT_THRESHOLD,
            actionRepeatThreshold: options.actionRepeatThreshold ?? DEFAULT_ACTION_REPEAT_THRESHOLD,
            actionWindowSize: options.actionWindowSize ?? DEFAULT_ACTION_WINDOW_SIZE,
            onStuck: options.onStuck,
        };
    }
    recordAction(action, params) {
        const key = JSON.stringify({ action, params });
        this.actionWindow.push(key);
        if (this.actionWindow.length > this.options.actionWindowSize) {
            this.actionWindow.shift();
        }
        let repeated = 0;
        for (let i = this.actionWindow.length - 1; i >= 0; i--) {
            if (this.actionWindow[i] !== key)
                break;
            repeated += 1;
        }
        if (repeated >= this.options.actionRepeatThreshold) {
            this.emitStuck({
                reason: "action_loop",
                count: repeated,
                action: { action, params },
            });
        }
    }
    recordScreenState(uiTree) {
        const hash = this.hashUiTree(uiTree);
        if (hash === this.lastScreenHash) {
            this.sameScreenCount += 1;
        }
        else {
            this.lastScreenHash = hash;
            this.sameScreenCount = 1;
        }
        if (this.sameScreenCount >= this.options.screenRepeatThreshold) {
            this.emitStuck({
                reason: "screen_loop",
                count: this.sameScreenCount,
                screenHash: hash,
            });
        }
    }
    isStuck() {
        return this.state;
    }
    reset() {
        this.actionWindow.length = 0;
        this.lastScreenHash = null;
        this.sameScreenCount = 0;
        this.state = { stuck: false, count: 0 };
    }
    emitStuck(event) {
        this.state = {
            stuck: true,
            reason: event.reason,
            count: event.count,
        };
        this.options.onStuck?.(event);
    }
    hashUiTree(uiTree) {
        const fingerprints = [];
        const walk = (element) => {
            fingerprints.push(`${element.resourceId}|${element.text}`);
            for (const child of element.children) {
                walk(child);
            }
        };
        for (const element of uiTree) {
            walk(element);
        }
        return createHash("sha1").update(fingerprints.join("::")).digest("hex");
    }
}
//# sourceMappingURL=stuck-detector.js.map