import type {IStatus} from "~/composables/Status.interface";
import type {IExpenseType} from "~/composables/settings/ExpenseType/ExpenseType.interface";

export interface IExpenses {
    uuid: string;
    description: string;
    amount: number;
    expenseType: IExpenseType;
    status: IStatus;
    createdAt: string;
}

export interface FormExpenses {
    idExpenseType: string;
    description: string;
    amount: number;
}