import type {ExecuteResponse} from "~/composables/apiResponse.interface";
import {getAccessToken} from "~/composables/api";
import {CustomError} from "~/composables/CustomError";
import type {ICurrency, ISettings} from "~/composables/settings/general/settings.interface";
import {EnvApiConfig} from "~/composables/Env.config";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

export const getSettingsService = async (): Promise<ISettings> => {
    const response: any = await fetch(`${BASE_URL_API}${API.SETTINGS}`, {
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

export const getCurrencyService = async (): Promise<ICurrency> => {
    const response: any = await fetch(`${BASE_URL_API}${API.CURRENCY_TYPE}`, {
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

export const updateSettingsService = async (data: ISettings, settingsId: string): Promise<ExecuteResponse> => {
    const response: any = await fetch(`${BASE_URL_API}${API.SETTINGS}/${settingsId}`, {
        method: 'PATCH',
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