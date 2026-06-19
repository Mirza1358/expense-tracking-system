"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showPromise } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getAuthErrorMessage, signIn } from "@/lib/auth";
import { loginSchema, type LoginFormData } from "@/lib/validators/auth";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard/expenses");
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await showPromise(
        signIn(data.email, data.password),
        {
          loading: "Signing in...",
          success: "Welcome back!",
          error: "Sign in failed",
        },
        { mapError: getAuthErrorMessage }
      );
      router.push("/dashboard/expenses");
    } catch {
      // Error toast already shown by showPromise
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Sign in
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Access your expense dashboard
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
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex justify-end">
          <Link
            href="/auth/reset-password"
            className="text-sm text-[var(--accent)] hover:brightness-110"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-[var(--accent)] hover:brightness-110"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
