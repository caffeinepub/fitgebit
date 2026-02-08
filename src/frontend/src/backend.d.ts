import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface AssistantTaskHabits {
    completions: Array<AssistantTaskCompletionRecord>;
    summary: AssistantTaskSummary;
}
export interface AssistantTaskCompletionRecord {
    completedOnTime: boolean;
    taskTitle: string;
    taskId: bigint;
    frequency: TaskFrequency;
    completionTimestamp: Time;
}
export type Time = bigint;
export interface OvertimeEntry {
    date: string;
    minutes: bigint;
    comment: string;
    timestamp: Time;
    isAdd: boolean;
}
export interface OvertimeTotals {
    totalHours: bigint;
    totalDays: bigint;
    totalMinutes: bigint;
}
export interface ToDoTask {
    id: bigint;
    completedBy?: Principal;
    title: string;
    createdAt: Time;
    createdBy: Principal;
    lastCompleted?: Time;
    isWeekly: boolean;
    description: string;
    evidencePhoto?: ExternalBlob;
    completionComment?: string;
    completedByUsername?: string;
    frequency: TaskFrequency;
    completionTimestamp?: Time;
    isPinned: boolean;
}
export interface Avatar {
    id: bigint;
    blob: ExternalBlob;
    name: string;
    description: string;
}
export interface AuditLogEntry {
    action: AuditLogAction;
    username: string;
    taskId: bigint;
    userPrincipal: Principal;
    timestamp: Time;
    changeSummary: string;
}
export interface AssistantTaskSummary {
    dailyTasks: bigint;
    totalTasks: bigint;
    username: string;
    completedTasks: bigint;
    taskPreferences: Array<[bigint, TaskPreference]>;
    weeklyTasks: bigint;
    monthlyTasks: bigint;
    onTimeTasks: bigint;
}
export interface TaskHistoryEntry {
    id: bigint;
    action: AuditLogAction;
    username: string;
    completedOnTime?: boolean;
    evidencePhoto?: ExternalBlob;
    summary: string;
    taskId: bigint;
    userPrincipal: Principal;
    completionComment?: string;
    userProfilePicture?: ExternalBlob;
    timestamp: Time;
    userAvatar?: Avatar;
    userInitials: string;
}
export interface UserProfile {
    presetAvatarId?: bigint;
    principal: Principal;
    username: string;
    role: UserRole;
    initials: string;
    language: Language;
    profilePicture?: ExternalBlob;
}
export enum AuditLogAction {
    taskUpdated = "taskUpdated",
    taskCreated = "taskCreated",
    taskMarkedDone = "taskMarkedDone"
}
export enum Language {
    french = "french",
    dutch = "dutch",
    english = "english"
}
export enum TaskFrequency {
    monthly = "monthly",
    daily = "daily",
    weekly = "weekly"
}
export enum TaskPreference {
    hated = "hated",
    preferred = "preferred",
    neutral = "neutral"
}
export enum UserRole {
    manager = "manager",
    assistant = "assistant"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    checkManagerNotifications(): Promise<boolean>;
    createTask(title: string, description: string, frequency: TaskFrequency, isWeekly: boolean): Promise<bigint>;
    deleteAssistantData(assistantPrincipal: Principal): Promise<void>;
    editLatestOvertimeEntry(username: string, newEntry: OvertimeEntry): Promise<void>;
    getAllAssistants(): Promise<Array<UserProfile>>;
    getAllAvatars(): Promise<Array<Avatar>>;
    getAllTaskHistory(): Promise<Array<TaskHistoryEntry>>;
    getAllTaskHistoryEntries(): Promise<Array<TaskHistoryEntry>>;
    getAllTasks(): Promise<Array<ToDoTask>>;
    getAssistantTaskHabits(username: string): Promise<AssistantTaskHabits>;
    getAuditLog(): Promise<Array<AuditLogEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getOvertimeEntries(username: string): Promise<Array<OvertimeEntry>>;
    getOvertimeTotals(username: string): Promise<OvertimeTotals>;
    getTask(taskId: bigint): Promise<ToDoTask | null>;
    getTaskHistory(taskId: bigint): Promise<Array<TaskHistoryEntry>>;
    getTaskPreferences(assistantUsername: string): Promise<Array<[bigint, TaskPreference]>>;
    getUnlockedAvatarIds(): Promise<Array<bigint>>;
    getUnlockedAvatars(): Promise<Array<Avatar>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logOvertime(date: string, minutes: bigint, comment: string, isAdd: boolean): Promise<void>;
    markTaskDone(taskId: bigint, photoData: ExternalBlob | null, completionComment: string | null): Promise<void>;
    registerAssistant(username: string, language: Language, initials: string): Promise<void>;
    resetUsersAndClearOrphanedState(clearTasks: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPresetAvatar(avatarId: bigint): Promise<Avatar>;
    setTaskPinnedStatus(taskId: bigint, isPinned: boolean): Promise<void>;
    setTaskPreference(assistantUsername: string, taskId: bigint, preference: TaskPreference): Promise<void>;
    updateTask(taskId: bigint, title: string, description: string, frequency: TaskFrequency, isWeekly: boolean): Promise<void>;
    uploadAvatar(name: string, description: string, content: ExternalBlob): Promise<Avatar>;
    uploadProfilePicture(content: ExternalBlob): Promise<ExternalBlob>;
}
