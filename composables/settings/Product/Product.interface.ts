import type {IStatus} from "~/composables/Status.interface";
import type {ICategory} from "~/composables/settings/Category/Category.interface";
import type {IProductSalesPrice} from "~/composables/settings/Product/ProductSalesPrice.interface";
import type {IUnit} from "~/composables/settings/Unit/Unit.interface";

export interface IProduct {
    uuid: string;
    designation: string;
    code?: string;
    description: string;
    unit: IUnit;
    category: ICategory;
    productSalesPrice: IProductSalesPrice[];
    status: IStatus;
}

export interface IProductRemainingStock {
    product_id: string;
    product_name: string;
    code: string;
    category_id: string;
    category_name: string;
    unit_id: string;
    unit_name: string;
    stock_input: number;
    stock_output: number;
    remaining_stock: number;
    product_sales_price_id: string;
    unit_price: number;
    wholesale_price: number;
    purchase_price: number;
}

export interface FormProduct {
    designation: string;
    code: string;
    description: string;
    idCategory: string;
    idUnit: string;
}