import {CustomError} from "~/composables/CustomError";
import type {ExecuteResponse, Paginate} from "~/composables/apiResponse.interface";
import type {TStatus} from "~/composables/Status.interface";
import {getAccessToken} from "~/composables/api";
import type {FormProduct, IProduct, IProductRemainingStock} from "~/composables/settings/Product/Product.interface";
import type {FormProductSalesPrice, IProductSalesPrice} from "~/composables/settings/Product/ProductSalesPrice.interface";
import {EnvApiConfig} from "~/composables/Env.config";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

export const getAllDataProductService = async (
    keyword: string,
    pageSize: number,
    currentPage: number,
    status: TStatus,
    category: string,
    unit: string,
): Promise<Paginate<IProduct[]>> => {
    const response: any = await fetch(`${BASE_URL_API}${API.PRODUCT}?limit=${pageSize}&page=${currentPage}&value=${keyword}&status=${status}&category=${category}&unit=${unit}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new CustomError(errorData.message, response.status);
    }

    return await response.json();
};

export const getAllDataProductSalesPriceService = async (
    pageSize: number,
    currentPage: number,
    idProduct: string
): Promise<Paginate<IProductSalesPrice[]>> => {
    const response: any = await fetch(`${BASE_URL_API}${API.PRODUCT_SALES_PRICE}/product/${idProduct}?limit=${pageSize}&page=${currentPage}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new CustomError(errorData.message, response.status);
    }

    return await response.json();
};

// export const updateProductSalesPriceService = async (
//     productSalesPrice: IProductSalesPrice,
// ): Promise<ExecuteResponse> => {
//     const data: {
//         unitPrice: number,
//         wholesale: number,
//         purchasePrice: number
//     } = {
//         unitPrice: productSalesPrice.unitPrice,
//         wholesale: productSalesPrice.wholesale,
//         purchasePrice: productSalesPrice.purchasePrice,
//     };
//
//     const response: any = await fetch(`${BASE_URL_API}${API.PRODUCT_SALES_PRICE}/${productSalesPrice.uuid}`, {
//         method: 'PATCH',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${getAccessToken()}`
//         },
//         body: JSON.stringify(data),
//     });
//
//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new CustomError(errorData.message, response.status);
//     }
//
//     return await response.json();
// };

export const insertOrUpdateProduct = async (data: FormProduct, id: string | null, method: string): Promise<ExecuteResponse> => {
    const path: string = id ? `${BASE_URL_API}${API.PRODUCT}/${id}` : `${BASE_URL_API}${API.PRODUCT}`;

    const response: any = await fetch(path, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new CustomError(errorData.message, response.status);
    }

    return await response.json();
};

export const insertNewProductSalePrice = async (data: FormProductSalesPrice): Promise<ExecuteResponse> => {
    const path: string = `${BASE_URL_API}${API.PRODUCT_SALES_PRICE}`;

    const response: any = await fetch(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new CustomError(errorData.message, response.status);
    }

    return await response.json();
};

export const deleteProductService = async (id: string | null): Promise<ExecuteResponse> => {
    const path: string = `${BASE_URL_API}${API.PRODUCT}/${id}`;

    const response: any = await fetch(path, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new CustomError(errorData.message, response.status);
    }

    return await response.json();
};

export const getAllProductWithRemainingStockService = async (
    keyword: string | null,
    limit: number | null,
    page: number | null,
    categoryId: string | null,
    unitId: string | null,
    startDate: string,
    endDate: string,
): Promise<Paginate<IProductRemainingStock[]>> => {
    const path: string = limit && page ? `${BASE_URL_API}${API.PRODUCT}/remaining/stock?limit=${limit}&page=${page}&value=${keyword}&category=${categoryId ? categoryId : ''}&unit=${unitId ? unitId : ''}&startDate=${startDate}&endDate=${endDate}` : `${BASE_URL_API}${API.PRODUCT}/remaining/stock`;
    const response: any = await fetch(path, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new CustomError(errorData.message, response.status);
    }

    return await response.json();
};

