import { randomUUID } from "node:crypto";
export class ApprovalQueue {
    pending = new Map();
    enqueue(request, defaultTimeoutMinutes) {
        const id = request.id ?? randomUUID();
        const timeoutMinutes = request.timeoutMinutes ?? defaultTimeoutMinutes;
        const expiresAt = Date.now() + timeoutMinutes * 60_000;
        this.pending.set(id, { request: { ...request, id }, expiresAt });
        return id;
    }
    resolve(id, decision) {
        const item = this.pending.get(id);
        if (!item)
            return null;
        this.pending.delete(id);
        return {
            id,
            decision,
            source: "channel_callback",
            metadata: item.request.metadata,
        };
    }
    expire(now = Date.now()) {
        const expired = [];
        for (const [id, item] of this.pending.entries()) {
            if (item.expiresAt > now)
                continue;
            this.pending.delete(id);
            expired.push({
                id,
                decision: "timeout",
                source: "timeout",
                metadata: item.request.metadata,
            });
        }
        return expired;
    }
    getPendingCount() {
        return this.pending.size;
    }
}
//# sourceMappingURL=approval-queue.js.map