import type {IStatus} from "~/composables/Status.interface";

export interface ISubject {
    uuid: string;
    designation: string;
    status: IStatus;
}

export interface FormSubject {
    designation: string;
}