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
export type Time = bigint;
export interface Feedback {
    id: string;
    createdAt: Time;
    reviewText: string;
    nurseId: string;
    patientName: string;
    mediaUrls: Array<ExternalBlob>;
    rating: bigint;
}
export interface ServiceProof {
    id: string;
    photoUrls: Array<ExternalBlob>;
    createdAt: Time;
    description: string;
    nurseId: string;
    videoUrl?: ExternalBlob;
}
export interface Nurse {
    id: string;
    bio: string;
    latitude?: number;
    name: string;
    profilePhoto?: ExternalBlob;
    isAvailable: boolean;
    registrationNumber: string;
    district: string;
    experience: bigint;
    longitude?: number;
    village: string;
    mandal: string;
    phone: string;
    pincode: bigint;
}
export interface UserProfile {
    name: string;
    email?: string;
    phone?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addServiceProof(proof: ServiceProof): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteNurse(nurseId: string): Promise<void>;
    deleteServiceProof(proofId: string): Promise<void>;
    filterByPincode(pincode: bigint): Promise<Array<Nurse>>;
    findNurseByCredentials(registrationNumber: string, phone: string): Promise<Nurse | null>;
    getAggregateRating(nurseId: string): Promise<number | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getNurse(id: string): Promise<Nurse | null>;
    getNurseFeedback(nurseId: string): Promise<Array<Feedback>>;
    getNurseServiceProofs(nurseId: string): Promise<Array<ServiceProof>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllNurses(): Promise<Array<Nurse>>;
    listAllServiceProofs(): Promise<Array<ServiceProof>>;
    registerNurse(nurse: Nurse): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setNurseAvailability(registrationNumber: string, phone: string, isAvailable: boolean): Promise<void>;
    submitFeedback(feedback: Feedback): Promise<void>;
    updateNurse(nurse: Nurse): Promise<void>;
    updateNurseLocation(registrationNumber: string, phone: string, latitude: number, longitude: number): Promise<void>;
    updateServiceProof(proof: ServiceProof): Promise<void>;
}
