"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/providers/AuthProvider";
import { signUpWithEmail, loginWithSocial, SocialProvider } from "@/services/auth";
import { validatePassword } from "@/lib/validation";
import SocialLoginButton from "./SocialLoginButton";
import FormField from "@/components/ui/FormField";
import Spinner from "@/components/ui/Spinner";

const signupSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .min(2, "닉네임은 2자 이상이어야 합니다.")
      .max(20, "닉네임은 20자 이하여야 합니다."),
    email: z.email("올바른 이메일 형식이 아닙니다."),
    password: z.string().min(1, "비밀번호를 입력해주세요."),
    isSeller: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const result = validatePassword(data.password, data.email);
    if (!result.valid) {
      ctx.addIssue({
        code: "custom",
        message: result.error ?? "비밀번호가 올바르지 않습니다.",
        path: ["password"],
      });
    }
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const { user, profile, loading, reloadProfile } = useAuth();
  const router = useRouter();
  const [socialLoading, setSocialLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { nickname: "", email: "", password: "", isSeller: false },
  });

  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      router.replace(profile.isSeller ? "/seller/products" : "/");
    }
  }, [user, profile, loading, router]);

  async function onSubmit(data: SignupFormData) {
    try {
      await signUpWithEmail(data.email, data.password, data.nickname.trim(), data.isSeller);
      await reloadProfile();
      router.replace(data.isSeller ? "/seller/products" : "/");
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/email-already-in-use") {
          setError("email", { message: "이미 사용 중인 이메일입니다." });
        } else {
          setError("root", { message: `회원가입 실패: ${err.code}` });
        }
      } else {
        setError("root", { message: "회원가입에 실패했습니다. 다시 시도해주세요." });
      }
    }
  }

  async function handleSocialLogin(provider: SocialProvider) {
    setSocialLoading(true);
    try {
      await loginWithSocial(provider);
    } catch {
      setError("root", { message: "소셜 로그인에 실패했습니다." });
    } finally {
      setSocialLoading(false);
    }
  }

  const disabled = isSubmitting || socialLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField label="닉네임" htmlFor="nickname" error={errors.nickname?.message}>
        <input
          id="nickname"
          type="text"
          {...register("nickname")}
          className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
        />
      </FormField>

      <FormField label="이메일" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
        />
      </FormField>

      <FormField label="비밀번호" htmlFor="password" error={errors.password?.message}>
        <input
          id="password"
          type="password"
          {...register("password")}
          className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
        />
        <p className="text-2xs text-ink-subtle tracking-wide">
          8자 이상 (3종류 조합) 또는 10자 이상 (2종류 조합)
        </p>
      </FormField>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          {...register("isSeller")}
          className="w-3.5 h-3.5 accent-brand"
        />
        <span className="text-2xs font-medium tracking-wide text-ink">판매자로 가입</span>
      </label>

      {errors.root && (
        <p className="text-2xs text-danger border-l-2 border-danger pl-3 py-1">
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="bg-brand text-white rounded-xs h-11 w-full text-2xs font-semibold tracking-[0.15em] uppercase hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity mt-1 inline-flex items-center justify-center"
      >
        {isSubmitting ? <Spinner size="sm" className="border-white/30 border-t-white" /> : "회원가입"}
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
            disabled={disabled}
          />
        ))}
      </div>

      <p className="text-center text-2xs text-ink-muted mt-1 tracking-wide">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-heading font-bold hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
