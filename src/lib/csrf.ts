import { NextResponse } from "next/server";

export function applyCSRF(response: NextResponse): NextResponse {
    const csrfToken = crypto.getRandomValues(new Uint8Array(16))
        .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');

    response.cookies.set('csrfToken', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
    });

    return response;
}