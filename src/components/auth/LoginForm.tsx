"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/providers/AuthProvider";
import { loginWithEmail, loginWithSocial, SocialProvider } from "@/services/auth";
import SocialLoginButton from "./SocialLoginButton";
import FormField from "@/components/ui/FormField";
import Spinner from "@/components/ui/Spinner";

const loginSchema = z.object({
  email: z.email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      router.replace(profile.isSeller ? "/seller/products" : "/");
    }
  }, [user, profile, loading, router]);

  async function onSubmit(data: LoginFormData) {
    try {
      await loginWithEmail(data.email, data.password);
    } catch (err: unknown) {
      if (
        err instanceof FirebaseError &&
        ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(
          err.code
        )
      ) {
        setError("root", { message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      } else {
        setError("root", { message: "로그인에 실패했습니다. 다시 시도해주세요." });
      }
    }
  }

  async function handleSocialLogin(provider: SocialProvider) {
    try {
      await loginWithSocial(provider);
    } catch {
      setError("root", { message: "소셜 로그인에 실패했습니다. 다시 시도해주세요." });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label="이메일" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          {...register("email")}
          placeholder="name@email.com"
          className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors placeholder:text-ink-subtle"
        />
      </FormField>

      <FormField label="비밀번호" htmlFor="password" error={errors.password?.message}>
        <input
          id="password"
          type="password"
          {...register("password")}
          className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
        />
      </FormField>

      {errors.root && (
        <p className="text-2xs text-danger border-l-2 border-danger pl-3 py-1">
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-brand text-white rounded-xs h-11 w-full text-2xs font-semibold tracking-[0.15em] uppercase hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity mt-1 inline-flex items-center justify-center"
      >
        {isSubmitting ? <Spinner size="sm" className="border-white/30 border-t-white" /> : "로그인"}
      </button>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 border-t border-rule" />
        <span className="text-2xs text-ink-subtle tracking-wide">또는</span>
        <div className="flex-1 border-t border-rule" />
      </div>

      <div className="flex flex-col gap-2">
        {(["google", "github"] as SocialProvider[]).map((p) => (
          <SocialLoginButton
            key={p}
            provider={p}
            onClick={() => handleSocialLogin(p)}
            disabled={isSubmitting}
          />
        ))}
      </div>

      <p className="text-center text-2xs text-ink-muted mt-1 tracking-wide">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-heading font-bold hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
