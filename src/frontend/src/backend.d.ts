import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
    completionComment?: string;
    completedByUsername?: string;
    frequency: TaskFrequency;
    evidencePhotoPath?: string;
    completionTimestamp?: Time;
    isPinned: boolean;
}
export interface AuditLogEntry {
    action: AuditLogAction;
    username: string;
    taskId: bigint;
    userPrincipal: Principal;
    timestamp: Time;
    changeSummary: string;
}
export interface TaskHistoryEntry {
    id: bigint;
    action: AuditLogAction;
    username: string;
    completedOnTime?: boolean;
    summary: string;
    taskId: bigint;
    userPrincipal: Principal;
    completionComment?: string;
    timestamp: Time;
    evidencePhotoPath?: string;
}
export interface UserProfile {
    principal: Principal;
    username: string;
    role: UserRole;
    language: Language;
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
    getAllAssistants(): Promise<Array<UserProfile>>;
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
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logOvertime(date: string, minutes: bigint, comment: string, isAdd: boolean): Promise<void>;
    markTaskDone(taskId: bigint, evidencePhotoPath: string | null, completionComment: string | null): Promise<void>;
    registerAssistant(username: string, language: Language): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setTaskPinnedStatus(taskId: bigint, isPinned: boolean): Promise<void>;
    setTaskPreference(assistantUsername: string, taskId: bigint, preference: TaskPreference): Promise<void>;
    updateTask(taskId: bigint, title: string, description: string, frequency: TaskFrequency, isWeekly: boolean): Promise<void>;
}
