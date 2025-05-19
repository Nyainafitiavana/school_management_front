import type {IStatus} from "~/composables/Status.interface";
import type {IRole} from "~/composables/Roles/role.interface";

export interface IUser {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phoneNumber1: string;
    phoneNumber2: string;
    isFullTime: boolean;
    netSalaryPerMonth: number;
    netSalaryPerHour: number;
    monthlyWorkingHour: number;
    UsersRoles: IUsersRoles[];
    status: IStatus;
}
export interface FormStateUser {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phoneNumber1: string;
    phoneNumber2: string;
    isFullTime: boolean;
    netSalaryPerMonth: number;
    netSalaryPerHour: number;
    monthlyWorkingHour: number;
}

export interface IUsersRoles {
    roles: IRole;
}