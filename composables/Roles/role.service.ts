import type {Paginate} from "~/composables/apiResponse.interface";
import {getAccessToken} from "~/composables/api";
import {CustomError} from "~/composables/CustomError";
import {EnvApiConfig} from "~/composables/Env.config";
import type {FormRole, IRole} from "~/composables/Roles/role.interface";
import {STCodeList} from "~/composables/Status.interface";

const BASE_URL_API: string = `${EnvApiConfig.host}:${EnvApiConfig.port}`;

export const getAllRolesService = async (
  limit: number,
  page: number,
  keyword: string,
  status: TStatus = STCodeList.ACTIVE,
): Promise<Paginate<IRole[]>> => {
  const response: any = await fetch(`${BASE_URL_API}${API.ROLE}/?limit=${limit}&page=${page}&value=${keyword}&status=${status}`, {
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

export const insertOrUpdateRole = async (
  data: FormRole,
  id: string | null,
  method: string
): Promise<ExecuteResponse> => {
  const path: string = id ? `${BASE_URL_API}${API.ROLE}/${id}` : `${BASE_URL_API}${API.ROLE}`;

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

export const deleteRoleService = async (id: string | null): Promise<ExecuteResponse> => {
  const path: string = `${BASE_URL_API}${API.ROLE}/${id}`;

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