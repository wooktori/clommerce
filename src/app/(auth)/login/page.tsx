import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* 브랜드 패널 */}
      <div className="bg-brand md:flex-1 flex items-center justify-center px-10 py-14 md:py-0">
        <div>
          <p className="text-white text-base font-bold tracking-[0.3em] uppercase mb-2">
            CLOMMERCE
          </p>
          <p className="text-white/30 text-2xs tracking-[0.2em] uppercase">
            mono. commerce.
          </p>
        </div>
      </div>

      {/* 폼 패널 */}
      <div className="md:flex-1 flex items-center justify-center px-8 py-12 md:px-16 bg-canvas">
        <div className="w-full max-w-xs">
          <h1 className="text-base font-bold text-heading tracking-tight mb-1">로그인</h1>
          <p className="text-2xs text-ink-muted mb-8 tracking-wide">
            커머스 계정으로 계속하기
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
