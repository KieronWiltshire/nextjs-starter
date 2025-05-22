import { createTranslator, Locale } from "next-intl";

export async function localeConfig(locale: Locale) {
    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
}

export async function getTranslator(locale: Locale) {
    const i18n = await localeConfig(locale);
    return createTranslator(i18n);
}