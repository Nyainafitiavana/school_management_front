import type {IStatus} from "~/composables/Status.interface";

export interface IProductSalesPrice {
    uuid: string;
    unitPrice: number;
    wholesale: number;
    purchasePrice: number;
    createdAt: string;
    status: IStatus;
}

export interface FormProductSalesPrice {
    unitPrice: number;
    wholesale: number;
    purchasePrice: number;
    idProduct: string;
}