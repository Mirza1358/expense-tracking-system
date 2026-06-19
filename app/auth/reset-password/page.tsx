"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showPromise } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getAuthErrorMessage, resetPassword } from "@/lib/auth";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validators/auth";

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await showPromise(
        resetPassword(data.email),
        {
          loading: "Sending reset link...",
          success: "Password reset email sent — check your inbox",
          error: "Failed to send reset email",
        },
        { mapError: getAuthErrorMessage }
      );
    } catch {
      // Error toast already shown by showPromise
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Reset password
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          We&apos;ll send a reset link to your email
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Remember your password?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-[var(--accent)] hover:brightness-110"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
