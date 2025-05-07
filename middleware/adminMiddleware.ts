import { defineNuxtRouteMiddleware } from 'nuxt/app';

export default defineNuxtRouteMiddleware(() => {
    if (typeof window !== 'undefined') {
        const isAdmin = localStorage.getItem('is_admin');
        if (!isAdmin || isAdmin !== 'true') {
            window.location.href = RouteList.LOGIN;
        }
    }
});
