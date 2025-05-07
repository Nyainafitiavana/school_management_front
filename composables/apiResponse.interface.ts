export interface Paginate<T> {
    data: T;
    totalRows: number;
    page: number;
}

export interface ExecuteResponse {
    message: string;
    statusCode: number;
}