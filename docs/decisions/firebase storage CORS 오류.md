# Firebase Storage CORS 오류

## Situation

상품 등록 시 이미지를 Firebase Storage에 업로드하는 과정에서 아래 오류가 발생했다.

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...'
from origin 'http://localhost:3000' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
It does not have HTTP ok status.
```

브라우저는 다른 출처(origin)로 요청을 보내기 전에 서버에 **preflight 요청(OPTIONS)**을 먼저 보내
해당 출처가 허용되는지 확인한다. Firebase Storage 버킷은 기본적으로 허용된 출처가 없어
preflight에 실패하고 실제 업로드 요청이 차단된다.

## Task

- 브라우저에서 Firebase Storage로 이미지를 정상적으로 업로드하기 위해
  Storage 버킷에 허용할 출처(origin)를 명시해야 했다
- 로컬 개발 환경(`http://localhost:3000`)과 프로덕션 도메인 모두 허용해야 했다

## Action

CORS는 **서버(Firebase Storage 버킷) 설정**으로만 해결할 수 있다.
클라이언트 코드를 수정하거나 Next.js 설정을 변경하는 방법으로는 해결되지 않는다.

아래 내용의 `cors.json`을 작성했다.

```json
[
  {
    "origin": ["http://localhost:3000", "https://wookommerce-c081a.web.app"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

Google Cloud Console에서 해당 Storage 버킷의 CORS 구성에 위 내용을 적용해 해결했다.
(`gsutil cors set cors.json gs://wookommerce-c081a.firebasestorage.app`과 동일한 효과)

## Firebase Storage와 Google Cloud Console의 관계

Firebase Storage는 내부적으로 **Google Cloud Storage 위에서 동작**한다.

```
Firebase Storage (Firebase 브랜드, 쉬운 SDK)
        ↕
Google Cloud Storage (실제 파일이 저장되는 인프라)
```

Firebase가 Google Cloud의 서비스를 래핑한 것이기 때문에 역할이 나뉜다.

| 설정 항목 | 어디서 관리 |
|---|---|
| Storage 활성화, 보안 규칙 | Firebase Console |
| CORS, 버킷 고급 설정 | Google Cloud Console / gsutil |

Firebase Console은 편의성을 위해 Cloud Storage를 감싸고 있지만 모든 설정을 노출하지 않는다.
CORS는 Firebase Console에 UI가 없기 때문에 실제 인프라를 직접 건드릴 수 있는
Google Cloud Console이나 `gsutil`로 접근해서 설정해야 한다.

## Result

**버킷에 CORS 정책을 적용한 뒤 이미지 업로드가 정상 동작했다.**

Firebase Storage를 클라이언트 SDK로 사용할 때는 신규 버킷 생성 시
반드시 CORS 설정을 함께 진행해야 한다.
프로덕션 도메인이 추가될 때마다 `cors.json`의 `origin` 배열에 도메인을 추가하고
재적용해야 한다.
