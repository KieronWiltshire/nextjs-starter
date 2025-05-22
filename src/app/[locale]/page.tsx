import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { WorkOS } from "@workos-inc/node";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SignOutButton } from "@/components/auth/sign-out-button";

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export default async function HomePage() {
    const session = await getSession();
    const t = await getTranslations();

    const jwksUrl = workos.userManagement.getJwksUrl('client_01JV34XEYE03XS3HD00H0J4AJ6');

    return (
      <div className="container mx-auto">
        <div className="flex justify-end py-4 gap-2">
          {session.auth ? (
            <SignOutButton variant="outline">
              {t('auth.sign-out')}
            </SignOutButton>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/auth/sign-in">
                  {t('auth.sign-in')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/sign-up">
                  {t('auth.sign-up')}
                </Link>
              </Button>
            </>
          )}
        </div>
        <pre className="p-4 rounded-lg overflow-auto">
          {jwksUrl}
        </pre>
        <pre className="p-4 rounded-lg overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    );
}
