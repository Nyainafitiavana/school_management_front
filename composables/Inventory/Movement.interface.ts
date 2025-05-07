import type {IStatus} from "~/composables/Status.interface";
import type {IUser} from "~/composables/settings/User/User.interface";

export interface IMovement {
    uuid: string;
    createdAt: string;
    updatedAt: string;
    isSales: boolean;
    editor: IUser;
    validator: IUser | null;
    status: IStatus;
}

export interface IDetails {
    detail_id?: string;
    product_id: string;
    product_name: string;
    quantity: number;
    quantity_delivered: number;
    category_id: string;
    category_name: string;
    unit_id: string;
    unit_name: string;
    is_unit_price: boolean;
    product_sales_price_id: string;
    unit_price: number;
    wholesale_price: number;
    purchase_price: number;
    remaining_stock: number;
}

export interface IFormDetails {
    idProduct: string;
    isUnitPrice: boolean;
    quantity: number;
    quantityDelivered?: number;
}

export interface IInvoicePayload {
    details: IDetails[],
    amountPaid: number;
    client: string;
    language: 'ENG' | 'FR';
    format: 'TICKET' | 'A4';
}

export interface IBodyMovement {
    isSales: boolean;
    details: IFormDetails[];
}

export interface IFormReject {
    observation: string;
}

export interface IHistoryValidation {
    uuid: string;
    createdAt: string;
    observation: string;
    validator: {
        firstName: string;
        lastName: string;
    };
    status: {
        uuid: string;
        designation: string;
        code: string;
    };
}

export interface IInvoice {
    uuid: string;
    reference: string;
    editor: IUser;
    clientName: string;
    createdAt: string;
    fileName: string;
}