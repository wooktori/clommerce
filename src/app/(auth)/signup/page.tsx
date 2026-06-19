import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>
        <SignupForm />
      </div>
    </main>
  );
}
