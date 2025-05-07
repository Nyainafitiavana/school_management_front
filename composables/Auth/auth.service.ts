import {EnvApiConfig} from "~/composables/Env.config";
import type {AuthInterface, LogoutInterface} from "~/composables/Auth/auth.interface";
import {getAccessToken} from "~/composables/api";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

export const loginUser = async (userData: { email: string, password: string }): Promise<AuthInterface> => {

    const response = await fetch(`${BASE_URL_API}${API.LOGIN}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    const data: AuthInterface = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return {
        message: data.message,
        access_token: data.access_token,
        is_admin: data.is_admin,
        id: data.id,
    };
};

export const logoutUser = async (): Promise<LogoutInterface> => {

    const response = await fetch(`${BASE_URL_API}${API.LOGOUT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
    });

    const data: LogoutInterface = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return {
        statusCode: data.statusCode,
        message: data.message,
    };
};

export const testTokenUser = async (): Promise<LogoutInterface> => {

    const response = await fetch(`${BASE_URL_API}${API.TEST_TOKEN}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
    });

    const data: LogoutInterface = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return {
        statusCode: data.statusCode,
        message: data.message,
    };
};