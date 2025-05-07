import type {IUser} from "~/composables/settings/User/User.interface";
import {CustomError} from "~/composables/CustomError";
import type {Paginate} from "~/composables/apiResponse.interface";
import type {TStatus} from "~/composables/Status.interface";
import {getAccessToken} from "~/composables/api";
import {EnvApiConfig} from "~/composables/Env.config";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

export const getAllUser = async (
    keyword: string,
    pageSize: number,
    currentPage: number,
    status: TStatus,
): Promise<Paginate<IUser[]>> => {
    const response: any = await fetch(`${BASE_URL_API}${API.USER}?limit=${pageSize}&page=${currentPage}&value=${keyword}&status=${status}`, {
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

export const getOneUser = async (id: string): Promise<IUser> => {
    const response: any = await fetch(`${BASE_URL_API}${API.USER}/${id}`, {
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

export const insertOrUpdateUser = async (data: IUser, id: string | null, method: string): Promise<IUser> => {
    const path: string = id ? `${BASE_URL_API}${API.USER}/${id}` : `${BASE_URL_API}${API.USER}`;

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

export const deleteUserService = async (id: string | null): Promise<IUser> => {
    const path: string = `${BASE_URL_API}${API.USER}/${id}`;

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
