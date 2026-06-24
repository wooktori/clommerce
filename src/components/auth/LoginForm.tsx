"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/providers/AuthProvider";
import { loginWithEmail, loginWithSocial, SocialProvider } from "@/services/auth";
import SocialLoginButton from "./SocialLoginButton";

export default function LoginForm() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      router.replace(profile.isSeller ? "/seller/products" : "/");
    }
  }, [user, profile, loading, router]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: unknown) {
      if (
        err instanceof FirebaseError &&
        ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(err.code)
      ) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
      setSubmitting(false);
    }
  }

  async function handleSocialLogin(provider: SocialProvider) {
    setError("");
    setSubmitting(true);
    try {
      await loginWithSocial(provider);
    } catch {
      setError("소셜 로그인에 실패했습니다. 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-2xs font-semibold tracking-[0.12em] uppercase text-ink-muted">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@email.com"
          required
          className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors placeholder:text-ink-subtle"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-2xs font-semibold tracking-[0.12em] uppercase text-ink-muted">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      {error && (
        <p className="text-2xs text-danger border-l-2 border-danger pl-3 py-1">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-brand text-white rounded-xs h-11 w-full text-2xs font-semibold tracking-[0.15em] uppercase hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity mt-1"
      >
        {submitting ? "처리 중..." : "로그인"}
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
            disabled={submitting}
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
