import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types/user";

type FirestoreUserData = {
  id: string;
  email: string;
  isSeller: boolean;
  nickname: string;
  createdAt?: { toDate?: () => Date };
  updatedAt?: { toDate?: () => Date };
};

function toUserProfile(data: FirestoreUserData): UserProfile {
  return {
    id: data.id,
    email: data.email,
    isSeller: data.isSeller,
    nickname: data.nickname,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return toUserProfile(snap.data() as FirestoreUserData);
}

export async function getOrCreateSocialUserProfile(
  user: User
): Promise<UserProfile> {
  const existing = await getUserProfile(user.uid);
  if (existing) return existing;

  const now = new Date();
  const profile: UserProfile = {
    id: user.uid,
    email: user.email ?? "",
    isSeller: false,
    nickname: user.displayName ?? user.email?.split("@")[0] ?? "사용자",
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, "users", user.uid), {
    id: profile.id,
    email: profile.email,
    isSeller: profile.isSeller,
    nickname: profile.nickname,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return profile;
}
