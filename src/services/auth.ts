import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  AuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type SocialProvider = "google";

const providerMap: Record<SocialProvider, AuthProvider> = {
  google: new GoogleAuthProvider(),
  // 새 소셜 로그인 추가 시 여기에만 추가
  // github: new GithubAuthProvider(),
};

export async function signUpWithEmail(
  email: string,
  password: string,
  nickname: string,
  isSeller: boolean
): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    email,
    isSeller,
    nickname,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithSocial(provider: SocialProvider): Promise<void> {
  const result = await signInWithPopup(auth, providerMap[provider]);
  const { user } = result;
  const additionalUserInfo = getAdditionalUserInfo(result);

  if (additionalUserInfo?.isNewUser) {
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      email: user.email ?? "",
      isSeller: false,
      nickname: user.displayName ?? user.email?.split("@")[0] ?? "사용자",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
