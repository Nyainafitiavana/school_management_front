import type {IStatus} from "~/composables/Status.interface";

export interface IUser {
    uuid?: string;
    firstName: string;
    lastName: string;
    isAdmin?: boolean;
    email: string;
    phone: string;
    status?: IStatus;
}
export interface FormStateUser {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isAdmin?: boolean;
    password?: string;
    confirmPassword?: string;
}