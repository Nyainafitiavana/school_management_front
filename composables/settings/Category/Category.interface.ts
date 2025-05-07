import type {IStatus} from "~/composables/Status.interface";

export interface ICategory {
    uuid: string;
    designation: string;
    status: IStatus;
}

export interface FormCategory {
    designation: string;
}