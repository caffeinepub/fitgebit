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
export interface ManagerRegistrationPayload {
    username: string;
    initials: string;
    language: Language;
    registrationToken: string;
}
export interface AssistantRegistrationPayload {
    username: string;
    overtime: bigint;
    initials: string;
    language: Language;
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
export enum Language {
    french = "french",
    dutch = "dutch",
    english = "english"
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
    flushUserAccount(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerAssistant(payload: AssistantRegistrationPayload): Promise<boolean>;
    registerManager(payload: ManagerRegistrationPayload): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    validateManagerToken(token: string): Promise<boolean>;
}
