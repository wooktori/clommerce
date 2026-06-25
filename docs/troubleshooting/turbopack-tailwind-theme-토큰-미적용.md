# Turbopack + Tailwind CSS v4 `@theme {}` 토큰 미적용

## Situation

헤더 컴포넌트(`Header.tsx`)에 `bg-brand`, `text-white`를 적용했는데
브라우저에서 헤더 영역 전체가 투명하게 렌더링됐다.
`text-white`는 배경이 없으면 흰 배경에 흰 텍스트가 되므로 CLOMMERCE 브랜드 문구가 사라진 것처럼 보였다.

에러 메시지는 없었다. 빌드도 정상, 콘솔도 조용했다.

## Task

- `bg-brand`가 왜 적용되지 않는지 원인을 찾아야 했다
- `globals.css`의 `@theme {}` 블록에 `--color-brand: #4570b2`를 정의했고
  Tailwind v4는 `@theme {}` 안의 CSS 변수를 유틸리티 클래스로 자동 생성하도록 설계되어 있다

## Action

### 1단계 — 컴파일된 CSS 출력물 직접 확인

에러가 없는 무증상 문제이므로 Tailwind가 실제로 어떤 CSS를 만들어냈는지 확인했다.

```
.next/dev/static/chunks/src_app_globals_css_*.single.css
```

1958줄짜리 파일을 열어보니 `bg-white`, `text-xs` 같은 기본 유틸리티는 존재하지만
`--color-brand`, `bg-brand`, `bg-canvas` 등 `@theme {}`에 정의한 커스텀 토큰은
**단 하나도 없었다.**

기본 `--text-xs: .75rem`이 들어 있고, `globals.css`에서 `0.6875rem`으로 재정의한 값은
없었다. `@theme {}` 블록 자체가 처리되지 않은 것이다.

### 2단계 — 빌드 파이프라인 추적

Next.js 16은 개발 서버에서 Turbopack을 기본 번들러로 사용한다.
`.next/dev/static/chunks/` 경로가 Turbopack 출력 경로임을 확인했다.
(webpack 출력이었다면 `.next/static/chunks/` 구조를 가진다.)

Tailwind CSS v4는 두 가지 방식으로 동작한다:

| 방식 | 진입점 | 역할 |
|---|---|---|
| PostCSS 플러그인 (`@tailwindcss/postcss`) | PostCSS 파이프라인 | `@import "tailwindcss"`, `@theme {}` 처리 |
| Vite / Turbopack 네이티브 | 번들러 내장 | `@import "tailwindcss"` 인터셉트, 기본 유틸리티 생성 |

Turbopack은 `@import "tailwindcss"`를 **네이티브로 인터셉트**해서 기본 Tailwind 유틸리티를
직접 생성한다. 이 과정에서 PostCSS 파이프라인이 **실행되지 않는다.**

`@theme {}` 블록은 PostCSS 플러그인(`@tailwindcss/postcss`)이 처리하는 구문이다.
Turbopack이 PostCSS를 건너뛰므로 `@theme {}`은 무시되고,
`--color-brand`가 CSS 변수로 등록되지 않는다.
`bg-brand` 유틸리티가 생성되지 않으면 브라우저는 클래스를 무시 → 투명 배경.

### 3단계 — `--no-turbopack` 시도 및 실패

```json
"scripts": {
  "dev": "next dev --no-turbopack"
}
```

실행 결과:

```
error: unknown option '--no-turbopack'
  Did you mean --turbopack?
```

Next.js 15까지는 `--turbopack` 플래그로 Turbopack을 **선택적으로 켜는** 방식이었지만
Next.js 16에서는 Turbopack이 **기본값**이 됐고 `--no-turbopack` 옵션은 존재하지 않는다.

## Result

**원인**: Turbopack이 PostCSS 파이프라인을 우회하기 때문에 `@tailwindcss/postcss`가 실행되지 않고,
Tailwind v4의 `@theme {}` 커스텀 토큰이 처리되지 않는다.

**근본 해결**: `next.config`에서 `turbopack.rules`로 CSS 처리 파이프라인을 커스터마이즈하거나,
Turbopack이 `@theme {}` 처리를 공식 지원할 때까지는 CSS 변수를 `@theme {}` 대신
`:root {}` 블록에 직접 정의하고, Tailwind 유틸리티를 `@layer utilities`에 직접 선언하는
방식으로 우회할 수 있다.

**교훈**: 에러 메시지가 없는 스타일 이슈는 컴파일 출력물을 직접 열어서 기대한 CSS가
실제로 생성됐는지 확인하는 것이 진단의 출발점이다.
프레임워크나 번들러를 업그레이드할 때는 빌드 파이프라인의 책임 경계가 바뀔 수 있다는 것을 전제해야 한다.
