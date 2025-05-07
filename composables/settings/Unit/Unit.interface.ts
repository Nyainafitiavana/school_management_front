import type {IStatus} from "~/composables/Status.interface";

export interface IUnit {
    uuid: string;
    designation: string;
    status: IStatus;
}

export interface FormUnit {
    designation: string;
}