import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  AuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type SocialProvider = "google" | "github";

const providerMap: Record<SocialProvider, AuthProvider> = {
  google: new GoogleAuthProvider(),
  github: new GithubAuthProvider(),
};

export async function signUpWithEmail(
  email: string,
  password: string,
  nickname: string,
  isSeller: boolean
): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  try {
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      email,
      isSeller,
      nickname,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    await user.delete();
    throw e;
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

// 소셜 로그인: 신규 유저 프로필 생성은 AuthProvider의 onAuthStateChanged에서 처리
export async function loginWithSocial(provider: SocialProvider): Promise<void> {
  await signInWithPopup(auth, providerMap[provider]);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
