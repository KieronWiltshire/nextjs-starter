'use client';

import { useForm } from "react-hook-form";
import { useSignOut } from "@/hooks/actions";
import { useCSRF } from "@/hooks/use-csrf";
import { Button } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { ReactNode } from "react";

type SignOutButtonProps = Omit<React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>, 'type'> & {
  children?: ReactNode;
};

export function SignOutButton({ children, ...props }: SignOutButtonProps) {
  const { execute: executeSignOut, isPending } = useSignOut();
  const csrfToken = useCSRF();
  const form = useForm();

  const handleSignOut = async () => {
    try {
      await executeSignOut({ csrfToken: csrfToken() });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSignOut)}>
      <Button
        type="submit"
        disabled={isPending}
        {...props}
      >
        {children}
      </Button>
    </form>
  );
}
