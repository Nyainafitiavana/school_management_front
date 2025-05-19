import type {NoPaginateData} from "~/composables/apiResponse.interface";
import type {IUserMenu} from "~/composables/menu/menu.interface";
import {getAccessToken} from "~/composables/api";
import {CustomError} from "~/composables/CustomError";
import {EnvApiConfig} from "~/composables/Env.config";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

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