import {CustomError} from "~/composables/CustomError";
import type {ExecuteResponse, Paginate} from "~/composables/apiResponse.interface";
import type {TStatus} from "~/composables/Status.interface";
import {getAccessToken} from "~/composables/api";
import type {FormExpenses, IExpenses} from "~/composables/Expenses/Expenses.interface";
import {EnvApiConfig} from "~/composables/Env.config";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

export const getAllExpensesService = async (
    pageSize: number | string,
    currentPage: number | string,
    expensesTypeId: string,
    startDate: string,
    endDate: string,
    status: TStatus
): Promise<Paginate<IExpenses[]>> => {
    const response: any = await fetch(`${BASE_URL_API}${API.EXPENSES}?limit=${pageSize}&page=${currentPage}&expenseTypeId=${expensesTypeId}&startDate=${startDate}&endDate=${endDate}&status=${status}`, {
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

export const insertOrUpdateExpenses = async (data: FormExpenses, id: string | null, method: string): Promise<ExecuteResponse> => {
    const path: string = id ? `${BASE_URL_API}${API.EXPENSES}/${id}` : `${BASE_URL_API}${API.EXPENSES}`;

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

export const deleteExpensesService = async (id: string | null): Promise<ExecuteResponse> => {
    const path: string = `${BASE_URL_API}${API.EXPENSES}/${id}`;

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
