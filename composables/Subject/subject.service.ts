import {CustomError} from "~/composables/CustomError";
import type {Paginate} from "~/composables/apiResponse.interface";
import type {TStatus} from "~/composables/Status.interface";
import type {FormSubject, ISubject} from "~/composables/Subject/Subject.interface";
import {getAccessToken} from "~/composables/api";
import {EnvApiConfig} from "~/composables/Env.config";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

export const getAllSubject = async (keyword: string, pageSize: number | string, currentPage: number | string, status: TStatus): Promise<Paginate<ISubject[]>> => {

    const response: any = await fetch(`${BASE_URL_API}${API.SUBJECT}?limit=${pageSize}&page=${currentPage}&value=${keyword}&status=${status}`, {
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

export const insertOrUpdateSubject = async (data: FormSubject, id: string | null, method: string): Promise<ExecuteResponse> => {
    const path: string = id ? `${BASE_URL_API}${API.SUBJECT}/${id}` : `${BASE_URL_API}${API.SUBJECT}`;

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

export const deleteSubjectService = async (id: string | null): Promise<ExecuteResponse> => {
    const path: string = `${BASE_URL_API}${API.SUBJECT}/${id}`;

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
