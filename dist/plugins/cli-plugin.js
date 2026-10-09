/**
 * Generic CLI plugin — wraps any JSON-outputting CLI tool as a pi-droid plugin.
 * Subclasses just define the command mapping and capabilities.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createTaskBudget } from "../adb/task-budget.js";
const exec = promisify(execFile);
export class CliPlugin {
    config = { cli_command: "" };
    capabilities;
    commandMap;
    activeBudget = null;
    constructor(defaultConfig, capabilities, commandMap) {
        this.config = defaultConfig;
        this.capabilities = capabilities;
        this.commandMap = commandMap;
    }
    async initialize(config) {
        this.config = { ...this.config, ...config };
    }
    getCapabilities() {
        return this.capabilities;
    }
    async runWithBudget(fn) {
        if (this.activeBudget || !this.config.task_budget) {
            return await fn();
        }
        const previousBudget = this.activeBudget;
        this.activeBudget = createTaskBudget(this.config.task_budget);
        try {
            return await fn();
        }
        finally {
            this.activeBudget = previousBudget;
        }
    }
    getOrCreateBudget() {
        if (this.activeBudget) {
            return this.activeBudget;
        }
        if (!this.config.task_budget) {
            return null;
        }
        return createTaskBudget(this.config.task_budget);
    }
    budgetExceededResult(action, budget) {
        return {
            success: false,
            error: `Task budget exceeded before action: ${action}`,
            data: {
                code: "budget_exceeded",
                action,
            },
            budget: budget.report(),
        };
    }
    withBudget(result, budget) {
        return { ...result, budget: budget.report() };
    }
    /**
     * Execute a CLI subcommand and parse the JSON response.
     * Tries stdout first, then stderr (some tools put error JSON there).
     */
    async runCli(command, args = []) {
        const fullArgs = command.split(" ").concat(args);
        try {
            const { stdout } = await exec(this.config.cli_command, fullArgs, {
                timeout: 60_000,
                env: { ...process.env },
            });
            return JSON.parse(stdout.trim());
        }
        catch (err) {
            const error = err;
            const stderr = error.stderr ?? "";
            try {
                return JSON.parse(stderr.trim());
            }
            catch {
                throw new Error(`CLI failed: ${stderr || error.message}`);
            }
        }
    }
    /**
     * Default execute — looks up the action in the command map and runs it.
     * Subclasses can override for custom actions.
     */
    async execute(action, params) {
        const mapping = this.commandMap[action];
        if (!mapping) {
            return { success: false, error: `Unknown action: ${action}` };
        }
        const budget = this.getOrCreateBudget();
        if (budget?.exceeded()) {
            return this.budgetExceededResult(action, budget);
        }
        budget?.tick();
        try {
            const args = mapping.args ? mapping.args(params) : [];
            const data = await this.runCli(mapping.command, args);
            const logEntry = mapping.logEntry ? mapping.logEntry(params, data) : undefined;
            if (!budget) {
                return { success: true, data, logEntry };
            }
            return this.withBudget({ success: true, data, logEntry }, budget);
        }
        catch (err) {
            const failure = {
                success: false,
                error: err instanceof Error ? err.message : String(err),
            };
            if (!budget) {
                return failure;
            }
            return this.withBudget(failure, budget);
        }
    }
    /** Override in subclasses for custom status logic. */
    async getStatus() {
        return { ready: true, message: `${this.displayName} plugin loaded` };
    }
    /** Override in subclasses for autonomous heartbeat behavior. */
    async onHeartbeat() {
        return null;
    }
    async destroy() {
        // Default no-op — subclasses can override.
    }
}
//# sourceMappingURL=cli-plugin.js.map