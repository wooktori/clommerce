@AGENTS.md

# Clommerce — 결제 커머스 프로젝트

무신사·네이버 쇼핑·쿠팡을 레퍼런스로 하는 결제 커머스 플랫폼.
인증, 상품 탐색, 장바구니, 가상 결제, 구매 내역을 포함한 풀스택 쇼핑 경험을 구현한다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router) + React 19 + TypeScript
- **스타일링**: Tailwind CSS v4
- **인증 / DB**: Firebase (Authentication + Firestore)
- **서버 상태**: React Query (TanStack Query) — 무한 스크롤 및 PreFetching
- **결제**: 결제 SDK 연동 (가상 결제)

## 핵심 구현 영역

- **인증**: 이메일·소셜 로그인, 인증 상태 기반 라우트 보호
- **상품**: 판매자·상품 상세 페이지, 무한 스크롤, 서버·라우트 레벨 PreFetching
- **장바구니 & 결제**: 장바구니 CRUD, 가상 결제 플로우, 구매 내역·주문 취소
- **UI / 성능**: 지연 로딩, SEO 메타데이터, `next/image`, 대규모 목록 가상화

## 개발 워크플로우

기능 구현 요청을 받으면 코드 작성 전에 반드시 플랜 모드로 아래 내용을 대화로 합의한다.

1. 요구사항 분석 및 정의
2. 사용할 기술과 선택 이유 (대안·트레이드오프 포함)
3. 구현 범위와 접근 방식

사용자가 계획에 동의한 뒤에만 구현을 시작한다.  
단순 버그 픽스·한 줄 수정은 이 단계를 생략해도 된다.

## 아키텍처 핵심 규칙

- **서버 컴포넌트 기본**: 훅·이벤트·브라우저 API 사용 시에만 `"use client"` 추가.
  클라이언트 컴포넌트는 트리 말단(Leaf)에 두어 RSC 영역을 최대화한다.
- **레이어 분리**: Firestore 읽기·쓰기는 `src/services/`에 집중.
  컴포넌트·훅에서 `getFirestore()` · `collection()` 직접 호출 금지.
- **Firebase 초기화**: `src/lib/firebase.ts` 단일 파일에서만 관리.
- **인증 상태**: `onAuthStateChanged` 기반 Context 하나로 관리. 중복 구독 금지.
- **React Query queryKey**: `[도메인, 식별자, ...파라미터]` 배열 형태로 통일.
  Query 훅은 `src/hooks/`에 도메인별 파일로 분리 (예: `useProducts.ts`).
- **path alias**: `@/` → `src/`. 상대 경로 (`../`)는 같은 폴더 내에서만 허용.
- **환경 변수**: `.env.local` 보관, 절대 커밋하지 않는다.

## 폴더 규칙

| 경로 | 역할 |
|---|---|
| `src/app/` | App Router 페이지 |
| `src/components/{domain}/` | UI 컴포넌트 (auth, product, cart, order, ui) |
| `src/hooks/` | React Query 훅 |
| `src/services/` | Firestore CRUD 함수 |
| `src/lib/` | 외부 서비스 초기화 (firebase.ts, queryClient.ts) |
| `src/providers/` | Context / Query Provider |
| `src/types/` | 공유 TypeScript 타입 |
