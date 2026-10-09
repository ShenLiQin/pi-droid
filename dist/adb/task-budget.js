export const DEFAULT_TASK_BUDGET = {
    stepLimit: 50,
    timeLimitMs: 5 * 60 * 1000,
};
export class TaskBudgetTracker {
    steps;
    time;
    constructor(config = {}) {
        this.steps = { used: 0, limit: config.stepLimit ?? DEFAULT_TASK_BUDGET.stepLimit };
        this.time = { startedAt: Date.now(), limitMs: config.timeLimitMs ?? DEFAULT_TASK_BUDGET.timeLimitMs };
    }
    exceeded() {
        return this.steps.used >= this.steps.limit || Date.now() - this.time.startedAt >= this.time.limitMs;
    }
    tick() {
        this.steps.used += 1;
    }
    report() {
        return {
            stepsUsed: this.steps.used,
            stepLimit: this.steps.limit,
            timeElapsed: Date.now() - this.time.startedAt,
            timeLimit: this.time.limitMs,
        };
    }
}
export function createTaskBudget(config = {}) {
    return new TaskBudgetTracker(config);
}
//# sourceMappingURL=task-budget.js.map