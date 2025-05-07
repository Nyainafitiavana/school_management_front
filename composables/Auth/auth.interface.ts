export interface AuthInterface {
    message: string;
    access_token: string;
    is_admin: boolean;
    id: string;
}

export interface LogoutInterface {
    statusCode: number;
    message: string;
}
