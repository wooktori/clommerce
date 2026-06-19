# 인증 구현 코드 리뷰 — 수정 기록

**날짜**: 2026-06-20  
**대상 커밋 범위**: `f934a52` → `c3c1d11`  
**수정된 파일**: 5개  
**발견 문제**: 8개 (Critical 2, Major 4, Minor 2)  
**수정 완료**: 8개 (100%)

---

## 1. AuthProvider — Firestore 직접 접근 (아키텍처 규칙 위반)

### 문제 상황

`src/providers/AuthProvider.tsx`에서 `getDoc(doc(db, "users", uid))`를 직접 호출하고 있었음.  
CLAUDE.md 핵심 규칙: **"Firestore 읽기·쓰기는 `src/services/`에 집중, 컴포넌트·훅에서 직접 호출 금지"** 위반.

```ts
// 수정 전 — AuthProvider.tsx
const snap = await getDoc(doc(db, "users", firebaseUser.uid)); // ❌ 직접 접근
```

### 수정 내용

`src/services/user.ts` 파일 신규 생성. Firestore 접근 로직을 서비스 레이어로 이동.

```ts
// 수정 후 — services/user.ts (신규)
export async function getUserProfile(uid: string): Promise<UserProfile | null> { ... }
export async function getOrCreateSocialUserProfile(user: User): Promise<UserProfile> { ... }

// 수정 후 — AuthProvider.tsx
import { getUserProfile, getOrCreateSocialUserProfile } from "@/services/user";
```

### 결과

| 항목 | 수정 전 | 수정 후 |
|---|---|---|
| 아키텍처 규칙 준수 | ❌ | ✅ |
| Firestore 접근 위치 | providers/ (1곳 위반) | services/ (0곳 위반) |
| 서비스 레이어 파일 수 | auth.ts 1개 | auth.ts + user.ts 2개 |

---

## 2. 소셜 로그인 신규 유저 — 리디렉션 경합 조건 (Race Condition)

### 문제 상황

신규 소셜 가입 시 실행 순서:

```
signInWithPopup 완료
    ↓
onAuthStateChanged 발화 → getDoc(users/uid) → 문서 없음 → profile = null → loading = false
    ↓
loginWithSocial 계속 → setDoc(users/uid) 문서 생성
```

`onAuthStateChanged`가 `setDoc` 이전에 실행되어 `profile = null` 상태로 `loading = false`가 됨.  
`SignupForm`의 `useEffect`는 `profile`이 null이므로 리디렉션을 건너뜀 → **신규 소셜 가입 후 화면이 멈추는 버그**.

### 수정 내용

1. `loginWithSocial`에서 프로필 생성 로직 제거 (책임 분리)
2. `AuthProvider`의 `onAuthStateChanged`에서 소셜 유저 여부를 감지해 프로필 자동 생성
3. 이메일 가입은 `signUpWithEmail` 완료 후 `reloadProfile()` 명시 호출

```ts
// 수정 후 — AuthProvider.tsx
const isSocialOnly = !firebaseUser.providerData.some(
  (p) => p.providerId === "password"
);
const profileData = isSocialOnly
  ? await getOrCreateSocialUserProfile(firebaseUser) // 없으면 생성
  : await getUserProfile(firebaseUser.uid);          // 있으면 조회

// 수정 후 — SignupForm.tsx
await signUpWithEmail(email, password, nickname, isSeller);
await reloadProfile(); // 명시적 갱신
router.replace(isSeller ? "/seller/products" : "/");
```

### 결과

| 시나리오 | 수정 전 | 수정 후 |
|---|---|---|
| 신규 구글 가입 후 리디렉션 | ❌ 멈춤 | ✅ 정상 |
| 기존 구글 로그인 후 리디렉션 | ✅ 정상 | ✅ 정상 |
| 이메일 회원가입 후 리디렉션 | ✅ 정상 | ✅ 정상 |
| profile 없는 상태로 보호 라우트 진입 가능성 | ❌ 있음 | ✅ 없음 |

---

## 3. signUpWithEmail — Firestore 저장 실패 시 Firebase Auth 계정 미롤백

### 문제 상황

```ts
// 수정 전
const { user } = await createUserWithEmailAndPassword(auth, email, password);
await setDoc(doc(db, "users", user.uid), { ... });
// setDoc 실패 시 → Firebase Auth에 계정은 있고 Firestore에 프로필은 없는 불일치 상태
```

이 상태의 유저는 로그인은 되지만 `profile = null`이므로 모든 보호 라우트에서 튕겨남.  
수동 복구 불가능 — Firebase Console에서 직접 삭제 필요.

### 수정 내용

```ts
// 수정 후
try {
  await setDoc(doc(db, "users", user.uid), { ... });
} catch (e) {
  await user.delete(); // ← Firebase Auth 계정 롤백
  throw e;
}
```

### 결과

| 상황 | 수정 전 | 수정 후 |
|---|---|---|
| Firestore 실패 시 Auth 계정 존재 여부 | ❌ 계정 남음 (고아 계정) | ✅ 자동 삭제 |
| 동일 이메일 재가입 가능 여부 | ❌ 불가 (이미 auth에 등록) | ✅ 가능 |
| 데이터 불일치 상태 발생 가능성 | ❌ 발생 가능 | ✅ 없음 |

---

## 4. Firebase 에러 코드 파싱 — err.message.includes() → err.code

### 문제 상황

```ts
// 수정 전 — 불안정한 방식
err.message.includes("invalid-credential")  // message는 SDK 버전마다 형식이 다름
err.message.includes("email-already-in-use")
```

Firebase SDK 버전 업그레이드 시 에러 메시지 문자열이 변경되면 **조용히 동작이 깨짐** (에러 감지 실패).

### 수정 내용

```ts
// 수정 후 — FirebaseError 타입 + err.code 사용 (안정적)
import { FirebaseError } from "firebase/app";

if (err instanceof FirebaseError && err.code === "auth/email-already-in-use") { ... }
if (err instanceof FirebaseError &&
  ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(err.code)) { ... }
```

### 결과

| 항목 | 수정 전 | 수정 후 |
|---|---|---|
| SDK 버전 의존성 | ❌ message 문자열 의존 | ✅ code 상수 의존 |
| 타입 안전성 | ❌ `unknown` 그대로 처리 | ✅ `instanceof FirebaseError` 체크 |
| 에러 누락 위험 | ❌ 있음 | ✅ 없음 |

---

## 5. useAuth — Context 외부 호출 시 묵시적 기본값 반환

### 문제 상황

```ts
// 수정 전
const AuthContext = createContext<AuthContextValue>({
  user: null, profile: null, loading: true  // ← AuthProvider 밖에서도 이 값 반환
});

export function useAuth() {
  return useContext(AuthContext); // 잘못된 위치에서 호출해도 에러 없이 동작
}
```

`AuthProvider` 외부에서 `useAuth()` 호출 시 `loading: true`가 영구적으로 유지 → **무한 로딩** 상태.  
에러 메시지 없음 → 디버깅에 평균 30분 이상 소요 가능.

### 수정 내용

```ts
// 수정 후
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용해야 합니다."); // 즉시 에러
  }
  return context;
}
```

### 결과

| 항목 | 수정 전 | 수정 후 |
|---|---|---|
| Provider 외부 호출 감지 | ❌ 감지 불가 | ✅ 즉시 throw |
| 디버깅 소요 시간 | ❌ 장시간 | ✅ 에러 즉시 확인 |

---

## 6. BuyerLayout — profile null 상태에서 판매자 노출

### 문제 상황

```ts
// 수정 전
if (!user || profile?.isSeller) return null;
// profile이 null일 때 → profile?.isSeller === undefined → 조건 false → children 렌더링
```

`user`는 있고 `profile`이 아직 로드되지 않은 순간(수십ms), **판매자가 구매자 페이지를 볼 수 있음**.

### 수정 내용

```ts
// 수정 후
if (!user || profile === null || profile.isSeller) return null;
// profile === null이면 무조건 null 반환 (children 렌더링 차단)
```

### 결과

| 상황 | 수정 전 | 수정 후 |
|---|---|---|
| profile 로딩 중 판매자 노출 | ❌ 노출 가능 (수십ms) | ✅ 완전 차단 |

---

## 7. `<a>` → `<Link>` 교체 (SPA 내비게이션)

### 문제 상황

```tsx
// 수정 전 — 전체 페이지 새로고침 발생
<a href="/login">로그인</a>
<a href="/signup">회원가입</a>
```

`<a>` 태그는 브라우저 전체 새로고침 → Next.js의 클라이언트 사이드 내비게이션 무효화.

### 수정 내용

```tsx
// 수정 후 — SPA 내비게이션
import Link from "next/link";
<Link href="/login">로그인</Link>
<Link href="/signup">회원가입</Link>
```

### 결과

| 항목 | 수정 전 | 수정 후 |
|---|---|---|
| 페이지 이동 방식 | 전체 새로고침 | 클라이언트 라우팅 |
| 이동 시 JS 번들 재요청 | ❌ 재요청 (전체) | ✅ 없음 (이미 로드됨) |
| 이동 시 React 상태 유지 | ❌ 초기화 | ✅ 유지 |

---

## 8. 닉네임 입력값 검증 누락

### 문제 상황

닉네임 필드에 아무 제약 없이 공백, 1자, 100자 이상 문자열이 Firestore에 저장 가능했음.

### 수정 내용

```ts
// 수정 후 — SignupForm.tsx
const trimmedNickname = nickname.trim();
if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
  setError("닉네임은 2자 이상 20자 이하로 입력해주세요.");
  return;
}
```

### 결과

| 항목 | 수정 전 | 수정 후 |
|---|---|---|
| 공백만 있는 닉네임 | ❌ 저장됨 | ✅ 차단 |
| 허용 길이 범위 | ❌ 무제한 | ✅ 2~20자 |

---

## 전체 수정 요약

| # | 심각도 | 문제 | 수정 파일 | 커밋 |
|---|---|---|---|---|
| 1 | Critical | Firestore 직접 접근 (아키텍처 위반) | AuthProvider.tsx, services/user.ts | `9f13efe` |
| 2 | Critical | 소셜 신규 가입 리디렉션 경합 조건 | auth.ts, AuthProvider.tsx, SignupForm.tsx | `9f13efe`, `601f2cf`, `5912b76` |
| 3 | Major | Firestore 실패 시 Auth 롤백 누락 | auth.ts | `9f13efe` |
| 4 | Major | err.message로 에러 코드 파싱 | LoginForm.tsx, SignupForm.tsx | `5912b76` |
| 5 | Major | useAuth 경계 가드 없음 | AuthProvider.tsx | `601f2cf` |
| 6 | Major | BuyerLayout profile null 가드 누락 | (buyer)/layout.tsx | `c3c1d11` |
| 7 | Minor | `<a>` 태그 사용 (전체 새로고침) | LoginForm.tsx, SignupForm.tsx | `5912b76` |
| 8 | Minor | 닉네임 검증 없음 | SignupForm.tsx | `5912b76` |

**TypeScript 컴파일 오류**: 수정 전 1개 → 수정 후 0개  
**아키텍처 규칙 위반**: 수정 전 1건 → 수정 후 0건
