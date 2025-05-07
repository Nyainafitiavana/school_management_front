import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';

export default defineNuxtRouteMiddleware(() => {
    if (typeof window !== 'undefined') {
        const userConnect = localStorage.getItem('access_token');
        if (userConnect === undefined || userConnect === '' || userConnect === null) {
            //window.location.href = RouteList.LOGIN;
            navigateTo(RouteList.LOGIN);
        }
    }
});


