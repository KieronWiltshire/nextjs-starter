import type { AuthenticationResponse } from "@workos-inc/node";

export type SessionData = {
    auth?: AuthenticationResponse | null;
};