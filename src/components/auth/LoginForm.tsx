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
      // profile 로드 후 useEffect에서 리다이렉트
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
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-black text-white rounded-lg py-2.5 font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "처리 중..." : "로그인"}
      </button>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-gray-200" />
        <span className="mx-3 text-xs text-gray-400">또는</span>
        <div className="flex-1 border-t border-gray-200" />
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

      <p className="text-center text-sm text-gray-500">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-black font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
