import type {IDataUserRole, IUser, IUsersRoles} from "~/composables/User/User.interface";
import {CustomError} from "~/composables/CustomError";
import type {NoPaginateData, Paginate} from "~/composables/apiResponse.interface";
import type {TStatus} from "~/composables/Status.interface";
import {getAccessToken} from "~/composables/api";
import {EnvApiConfig} from "~/composables/Env.config";
import type {IUserMenu} from "~/composables/menu/menu.interface";

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

export const insertOrUpdateUser = async (data: IUser, id: string | null, method: string): Promise<ExecuteResponse> => {
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

export const deleteUserService = async (id: string | null): Promise<ExecuteResponse> => {
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

export const getAllUserRolesService = async (
  userId: string,
): Promise<Paginate<IUsersRoles[]>> => {
    const response: any = await fetch(`${BASE_URL_API}${API.USER}/${userId}/roles?`, {
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


export const insertUserRoleService = async (data: IDataUserRole[]): Promise<ExecuteResponse> => {
    const path: string = `${BASE_URL_API}${API.USER}/roles`;

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

export const deleteUserRoleService = async (id: string | null): Promise<ExecuteResponse> => {
    const path: string = `${BASE_URL_API}${API.USER}/roles/${id}`;

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

export const getUserMenuService = async (userId: string): Promise<NoPaginateData<IUserMenu[]>> => {

    const response = await fetch(`${BASE_URL_API}${API.USER}/${userId}/roles`, {
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