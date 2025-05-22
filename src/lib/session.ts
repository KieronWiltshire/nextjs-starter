
import { SessionData } from "@/types/session";
import { AuthenticationResponse } from "@workos-inc/node";
import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export const sessionOptions = {
    cookieName: "session",
    password: process.env.APP_SECRET as string,
    ttl: 60 * 60 * 24 * 30,
    cookieOptions: {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
    },
};

export async function getSession() {
    return await getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function signIn(session: IronSession<SessionData>, authenticationResponse: AuthenticationResponse) {
    session.auth = authenticationResponse;
    await session.save();
}

export async function signOut(session: IronSession<SessionData>) {
    session.auth = null;
    await session.save();
}