import {CustomError} from "~/composables/CustomError";
import type {ExecuteResponse, Paginate} from "~/composables/apiResponse.interface";
import type {TStatus} from "~/composables/Status.interface";
import {getAccessToken} from "~/composables/api";
import type {FormExpenseType, IExpenseType} from "~/composables/settings/ExpenseType/ExpenseType.interface";
import {EnvApiConfig} from "~/composables/Env.config";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

export const getAllExpenseTypeService = async (
    keyword: string,
    pageSize: number | string,
    currentPage: number | string,
    status: TStatus
): Promise<Paginate<IExpenseType[]>> => {
    const response: any = await fetch(`${BASE_URL_API}${API.EXPENSE_TYPE}?limit=${pageSize}&page=${currentPage}&value=${keyword}&status=${status}`, {
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

export const insertOrUpdateExpenseType = async (data: FormExpenseType, id: string | null, method: string): Promise<ExecuteResponse> => {
    const path: string = id ? `${BASE_URL_API}${API.EXPENSE_TYPE}/${id}` : `${BASE_URL_API}${API.EXPENSE_TYPE}`;

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

export const deleteExpenseTypeService = async (id: string | null): Promise<ExecuteResponse> => {
    const path: string = `${BASE_URL_API}${API.EXPENSE_TYPE}/${id}`;

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
