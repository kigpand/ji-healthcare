# AI 운동 코치

홈의 **AI 운동 코치**에서 사용한다.

## 현재 구현

- 목표(근육 증가/체중 감량/체력 유지), 장소(헬스장/홈트/야외), 시간(5~180분), 장비를 SQLite에 저장·수정한다.
- 설정 변경 후 저장하기 전에는 추천을 실행할 수 없다. 변경 시 이전 결과도 비운다.
- 기기 로컬 시간 월요일 00:00부터 요청 시점까지의 기록, 현재 루틴, 카테고리와 설정을 하나의 요청 객체로 구성한다. 미래·잘못된 날짜의 기록은 제외한다.
- 앱은 Cloudflare Worker를 통해 OpenAI Responses API를 호출한다. OpenAI API 키는 앱에 저장하지 않는다.
- AI는 기존 루틴을 우선 검토하고, 적합한 루틴이 없으면 새 루틴 또는 휴식을 제안한다.
- 기존 루틴은 시작할 수 있다. 새 루틴은 이름·운동·세트·무게를 수정하고 카테고리를 선택한 다음 명시적으로 등록한다. 같은 결과의 등록 중/등록 완료 후 재등록을 막는다.
- 분석 결과는 화면 세션에만 유지한다. 설정과 사용자가 등록한 루틴은 영구 저장한다.

## 데이터와 한계

DB v2는 workout_profile 테이블만 추가한다. v1 테이블과 기록을 변경하지 않는다.
기존 기록에는 당시 실제 수행한 세트·무게·반복 횟수, 통증·회복 상태가 없다. 현재 루틴 구성을 과거 수행 기록으로 해석해서는 안 된다.

## 연결 구조

Cloudflare Worker에서 개인 접근 토큰, 요청 크기, 분당 호출 제한과 입력 검증을 적용한다. OpenAI API 키는 Worker Secret에만 저장한다. API 응답은 기존 루틴 ID / 새 루틴 초안 / 휴식 중 하나로 검증하고, 존재하지 않는 ID나 부적합한 수치는 거부한다. 요청 실패를 모의 성공으로 대체하지 않는다.

새 루틴의 자동 저장은 허용하지 않는다. 앱에 넣는 Worker 접근 토큰은 개인용 호출을 구분하기 위한 값이며 공개 앱의 사용자 인증을 대체하지 않는다.

## 로컬 설정

Worker의 `worker/.dev.vars`:

```dotenv
OPENAI_API_KEY=OpenAI 프로젝트 API 키
APP_ACCESS_TOKEN=충분히 긴 임의의 개인 접근 토큰
```

개인 접근 토큰은 다음 명령으로 생성하고, 출력된 한 값을 Worker와 앱에 동일하게 사용한다.

```bash
openssl rand -hex 32
```

앱의 `.env`:

```dotenv
EXPO_PUBLIC_AI_COACH_URL=http://localhost:8787
EXPO_PUBLIC_AI_COACH_ACCESS_TOKEN=Worker와 같은 개인 접근 토큰
```

```bash
npm run worker:dev
npm run start -- --dev-client
```

## 배포

```bash
npx wrangler secret put OPENAI_API_KEY --config worker/wrangler.jsonc
npx wrangler secret put APP_ACCESS_TOKEN --config worker/wrangler.jsonc
npm run worker:deploy
```

배포가 끝나면 `.env`의 `EXPO_PUBLIC_AI_COACH_URL`을 출력된 `workers.dev` 주소로 바꾸고 앱을 다시 빌드한다.

## 기기 검증 시나리오

1. 최초 진입 → 설정 저장 → 앱 종료·재실행 → 설정 유지.
2. 목표/장비 변경 → 이전 추천 제거 → 저장 전 실행 차단 → 저장 후 요청 내용 갱신.
3. 기존 루틴 추천 → 실제 루틴 표시 → 운동 시작.
4. 새 루틴 추천 → 수정/카테고리 선택 → 등록 → 연속 탭으로 중복 등록되지 않음.
5. 카테고리 없음/DB 오류 → 안내·재시도. 실패를 성공으로 표시하지 않음.
6. 일요일 밤과 월요일 자정에 각각 요청 → 주간 범위 갱신.

기기 UI·네이티브 SQLite 검증 결과는 실행 후 별도로 기록한다. Jest의 DB mock 검사는 실제 기기 테스트를 대체하지 않는다.
