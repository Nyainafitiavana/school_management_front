export class CustomError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export const handleInAuthorizedError = (error: Error) => {
    //Reset all localStorage variable
    localStorage.removeItem('access_token');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('userId');
    // Show error notification
    notification.error({
        message: 'Error',
        description: (error).message,
        class: 'custom-error-notification'
    });
    // Delay navigation to ensure notification shows
    setTimeout(() => {
        window.location.href = RouteList.LOGIN;
    }, 600);
}