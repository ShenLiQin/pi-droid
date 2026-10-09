import type { TaskBudget, TaskBudgetConfig, TaskBudgetReport } from "./types.js";
export declare const DEFAULT_TASK_BUDGET: Readonly<Required<TaskBudgetConfig>>;
export declare class TaskBudgetTracker implements TaskBudget {
    readonly steps: {
        used: number;
        limit: number;
    };
    readonly time: {
        startedAt: number;
        limitMs: number;
    };
    constructor(config?: TaskBudgetConfig);
    exceeded(): boolean;
    tick(): void;
    report(): TaskBudgetReport;
}
export declare function createTaskBudget(config?: TaskBudgetConfig): TaskBudgetTracker;
