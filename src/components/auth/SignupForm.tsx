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
      <div className="flex flex-col gap-2">
        <label htmlFor="nickname" className="text-2xs font-semibold tracking-[0.12em] uppercase text-ink-muted">
          닉네임
        </label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-2xs font-semibold tracking-[0.12em] uppercase text-ink-muted">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
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
        <p className="text-2xs text-ink-subtle tracking-wide">
          8자 이상 (3종류 조합) 또는 10자 이상 (2종류 조합)
        </p>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={isSeller}
          onChange={(e) => setIsSeller(e.target.checked)}
          className="w-3.5 h-3.5 accent-brand"
        />
        <span className="text-2xs font-medium tracking-wide text-ink">판매자로 가입</span>
      </label>

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
        {submitting ? "처리 중..." : "회원가입"}
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
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-heading font-bold hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
