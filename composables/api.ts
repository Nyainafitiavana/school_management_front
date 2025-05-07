export const API = {
    "LOGIN" : "/api/auth/login",
    "LOGOUT" : "/api/auth/logout",
    "TEST_TOKEN" : "/api/auth/test-token",
    "USER" : "/api/users",
}

export const getAccessToken = (): string | null => {
    return localStorage.getItem("access_token");
}