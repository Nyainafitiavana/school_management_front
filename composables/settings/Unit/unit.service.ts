import {CustomError} from "~/composables/CustomError";
import type {Paginate} from "~/composables/apiResponse.interface";
import type {TStatus} from "~/composables/Status.interface";
import {getAccessToken} from "~/composables/api";
import type {FormUnit, IUnit} from "~/composables/settings/Unit/Unit.interface";
import {EnvApiConfig} from "~/composables/Env.config";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

export const getAllUnit = async (keyword: string, pageSize: number | string, currentPage: number | string, status: TStatus): Promise<Paginate<IUnit[]>> => {
    const response: any = await fetch(`${BASE_URL_API}${API.UNIT}?limit=${pageSize}&page=${currentPage}&value=${keyword}&status=${status}`, {
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

export const insertOrUpdateUnit = async (data: FormUnit, id: string | null, method: string): Promise<IUnit> => {
    const path: string = id ? `${BASE_URL_API}${API.UNIT}/${id}` : `${BASE_URL_API}${API.UNIT}`;

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

export const deleteUnitService = async (id: string | null): Promise<IUnit> => {
    const path: string = `${BASE_URL_API}${API.UNIT}/${id}`;

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
