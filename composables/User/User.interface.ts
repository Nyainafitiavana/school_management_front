import type {IStatus} from "~/composables/Status.interface";
import type {IRule} from "~/composables/Rules/rule.interface";

export interface IUser {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phoneNumber1: string;
    phoneNumber2: string;
    isFullTime: string;
    netSalaryPerMonth: string;
    netSalaryPerHour: string;
    monthlyWorkingHour: string;
    UsersRules: IUsersRules[];
    status: IStatus;
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

export interface IUsersRules {
    rules: IRule;
}