import { cookies } from "next/headers";
import { object, string } from "zod";
import { createServerActionProcedure } from "zsa";

export const protectedSchema = object({
    csrfToken: string({ required_error: "CSRF token is required" })
      .min(1, "CSRF token is required"),
  });

export const protectedAction = createServerActionProcedure()
  .input(protectedSchema).handler(async ({input}) => {
      const csrfToken = (await cookies()).get('csrfToken')?.value;
      if (input.csrfToken !== csrfToken) throw new Error('Invalid CSRF token');
  });