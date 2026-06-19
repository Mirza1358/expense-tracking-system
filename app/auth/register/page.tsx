"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showPromise } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getAuthErrorMessage, signUp } from "@/lib/auth";
import { registerSchema, type RegisterFormData } from "@/lib/validators/auth";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard/expenses");
    }
  }, [user, loading, router]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await showPromise(
        signUp(data.email, data.password),
        {
          loading: "Creating your account...",
          success: "Account created successfully!",
          error: "Registration failed",
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
          Create account
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Start tracking your expenses today
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
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          hint="At least 8 characters with upper, lower, and a number"
          {...register("password")}
        />
        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
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
