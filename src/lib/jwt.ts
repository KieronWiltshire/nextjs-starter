import { SessionData } from "@/types/session";
import { WorkOS } from "@workos-inc/node";
import { IronSession } from "iron-session";
import { createRemoteJWKSet, jwtVerify } from 'jose';

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const JWKS = createRemoteJWKSet(new URL(workos.userManagement.getJwksUrl(process.env.WORKOS_CLIENT_ID)));

export async function isValidAccessToken(accessToken: string) {
    try {
        await jwtVerify(accessToken, JWKS);
        return true;
    } catch {
        return false;
    }
}

export async function decodeJwtFromSession(session: IronSession<SessionData>) {
    return jwtVerify(session.auth?.accessToken as string, JWKS);
}