import type {IStatus} from "~/composables/Status.interface";

export interface IExpenseType {
    uuid: string;
    designation: string;
    status: IStatus;
}

export interface FormExpenseType {
    designation: string;
}