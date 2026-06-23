"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/providers/AuthProvider";
import { signUpWithEmail, loginWithSocial, SocialProvider } from "@/services/auth";
import { validatePassword } from "@/lib/validation";
import SocialLoginButton from "./SocialLoginButton";

export default function SignupForm() {
  const { user, profile, loading, reloadProfile } = useAuth();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSeller, setIsSeller] = useState(false);
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

    const passwordCheck = validatePassword(password, email);
    if (!passwordCheck.valid) {
      setError(passwordCheck.error ?? "비밀번호가 올바르지 않습니다.");
      return;
    }

    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      setError("닉네임은 2자 이상 20자 이하로 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await signUpWithEmail(email, password, trimmedNickname, isSeller);
      await reloadProfile();
      router.replace(isSeller ? "/seller/products" : "/");
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        console.error("[SignupForm] FirebaseError:", err.code, err.message);
        if (err.code === "auth/email-already-in-use") {
          setError("이미 사용 중인 이메일입니다.");
        } else {
          setError(`회원가입 실패: ${err.code}`);
        }
      } else {
        console.error("[SignupForm] Unknown error:", err);
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSocialLogin(provider: SocialProvider) {
    setError("");
    setSubmitting(true);
    try {
      await loginWithSocial(provider);
    } catch {
      setError("소셜 로그인에 실패했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nickname" className="text-sm font-medium">
          닉네임
        </label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

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
        <p className="text-xs text-gray-500">
          8자 이상 (3종류 조합) 또는 10자 이상 (2종류 조합)
        </p>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSeller}
          onChange={(e) => setIsSeller(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm">판매자로 가입</span>
      </label>

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
        {submitting ? "처리 중..." : "회원가입"}
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
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-black font-medium hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
