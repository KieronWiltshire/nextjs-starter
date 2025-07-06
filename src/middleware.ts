import { NextRequest } from "next/server";
import { getSession, sessionOptions } from "./lib/session";
import { sealData } from "iron-session";
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { isValidAccessToken } from "./lib/jwt";
import { workos } from "./lib/workos";

export async function middleware(request: NextRequest) {
    const session = await getSession();
    const next = createMiddleware(routing)(request);

    if (session.auth) {
        const isValid = await isValidAccessToken(session.auth?.accessToken);

        if (!isValid) {
            try {
                const authenticationResponse = await workos.userManagement.authenticateWithRefreshToken({
                    clientId: process.env.WORKOS_CLIENT_ID as string,
                    refreshToken: session.auth?.refreshToken,
                });
        
                const sealed = await sealData({ ...session, auth: authenticationResponse }, sessionOptions);
                next.cookies.set(sessionOptions.cookieName, sealed);
            } catch {
                const sealed = await sealData({ ...session, auth: null }, sessionOptions);
                next.cookies.set(sessionOptions.cookieName, sealed);
            }
        }
    }

    return next;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: '/((?!webhooks|_next|_vercel|.*\\..*).*)'
};