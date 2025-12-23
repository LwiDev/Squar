import { browser } from '$app/environment';
import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./locales/en.json'));
register('fr', () => import('./locales/fr.json'));
register('es', () => import('./locales/es.json'));

init({
    fallbackLocale: 'en',
    initialLocale: browser ? getLocaleFromNavigator() : 'en',
});
