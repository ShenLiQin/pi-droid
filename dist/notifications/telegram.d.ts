import type { ApprovalRequest, ApprovalResult, NotificationChannel, ParsedCommand } from "./interface.js";
export interface TelegramChannelConfig {
    botToken: string;
    chatId: string;
    timeoutMinutes?: number;
    allowedCommands?: string[];
}
export declare class TelegramChannel implements NotificationChannel {
    private readonly token;
    private readonly chatId;
    private readonly defaultTimeoutMinutes;
    private readonly allowedCommands;
    private readonly approvals;
    private updateOffset;
    constructor(config: TelegramChannelConfig);
    sendMessage(text: string): Promise<void>;
    sendSummary(summary: Record<string, unknown>): Promise<void>;
    sendScreenshot(input: {
        photoPath: string;
        caption?: string;
    }): Promise<void>;
    requestApproval(request: ApprovalRequest): Promise<string>;
    poll(): Promise<{
        approvals: ApprovalResult[];
        commands: ParsedCommand[];
    }>;
    getPendingApprovals(): number;
    private callApi;
}
