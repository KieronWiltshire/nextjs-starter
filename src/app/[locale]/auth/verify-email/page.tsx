import { VerifyEmailForm } from "@/components/auth/verify-email-form";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string,
    code?: string,
    token?: string,
  }>
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <VerifyEmailForm {...(await searchParams)} />
    </div>
  )
}