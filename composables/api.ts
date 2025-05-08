export const API = {
    "LOGIN" : "/api/auth/login",
    "LOGOUT" : "/api/auth/logout",
    "TEST_TOKEN" : "/api/auth/test-token",
    "USER" : "/api/users",
    "SUBJECT" : "/api/subjects",
}

export const getAccessToken = (): string | null => {
    return localStorage.getItem("access_token");
}