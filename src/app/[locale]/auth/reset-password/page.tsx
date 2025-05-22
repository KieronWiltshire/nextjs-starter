import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token: string,
  }>
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <ResetPasswordForm {...(await searchParams)} />
    </div>
  );
}
