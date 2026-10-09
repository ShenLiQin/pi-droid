import type { ApprovalRequest, ApprovalResult } from "./interface.js";
export declare class ApprovalQueue {
    private pending;
    enqueue(request: ApprovalRequest, defaultTimeoutMinutes: number): string;
    resolve(id: string, decision: "approve" | "deny"): ApprovalResult | null;
    expire(now?: number): ApprovalResult[];
    getPendingCount(): number;
}
