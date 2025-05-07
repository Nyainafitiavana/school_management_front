import {CustomError} from "~/composables/CustomError";
import type {Paginate} from "~/composables/apiResponse.interface";
import type {TStatus} from "~/composables/Status.interface";
import type {FormCategory, ICategory} from "~/composables/settings/Category/Category.interface";
import {getAccessToken} from "~/composables/api";
import {EnvApiConfig} from "~/composables/Env.config";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

export const getAllCategory = async (keyword: string, pageSize: number | string, currentPage: number | string, status: TStatus): Promise<Paginate<ICategory[]>> => {

    const response: any = await fetch(`${BASE_URL_API}${API.CATEGORY}?limit=${pageSize}&page=${currentPage}&value=${keyword}&status=${status}`, {
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

export const insertOrUpdateCategory = async (data: FormCategory, id: string | null, method: string): Promise<ICategory> => {
    const path: string = id ? `${BASE_URL_API}${API.CATEGORY}/${id}` : `${BASE_URL_API}${API.CATEGORY}`;

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

export const deleteCategoryService = async (id: string | null): Promise<ICategory> => {
    const path: string = `${BASE_URL_API}${API.CATEGORY}/${id}`;

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
