# Ji Healthcare 작업 규칙

## 공통

- Expo 54 / React Native / TypeScript / 로컬 SQLite 프로젝트다. README.md부터 확인한다.
- 요청 범위, 가정, 성공 조건을 먼저 밝히고 필요한 최소 변경만 한다.
- 사용자 변경을 보존한다. 관계없는 리팩터링, 의존성 업그레이드, 비밀값 출력은 하지 않는다.
- npm과 package-lock.json을 기준으로 설치한다. pnpm-lock.yaml은 기존 파일이며 새 변경의 기준으로 사용하지 않는다.
- 화면은 렌더링, hooks는 상태·동작, schema는 검증, service와 lib/database.ts는 데이터 접근을 담당한다.
- SQLite 스키마 변경은 새 마이그레이션으로 추가한다. 기록 보존·트랜잭션·기존 설치 업그레이드를 검증한다.
- 버그 수정은 가능한 경우 실패하는 재현 테스트부터 만든다. 테스트를 약화하거나 skip 처리해서 통과시키지 않는다.
- 작업 완료 전 `npm run check`를 실행한다. 네이티브·라우팅·의존성 변경은 `npm run build:check`도 실행한다.
- 실행하지 않은 검증을 통과했다고 말하지 않는다. 실패 원인과 환경 제한을 구분한다.
- 최종 보고: 변경 목적, 파일, 실행한 검사와 결과, 남은 위험. 배포 작업은 커밋·플랫폼·프로필·빌드 ID도 남긴다.

## 역할별 진입점

사용자 요청에 해당하는 문서만 읽는다. 각 역할은 작업 절차이며 별도 에이전트 자동 실행을 의미하지 않는다.

| 요청 | 절차 |
| --- | --- |
| 개발·수정·리팩터링 | docs/harness/development.md |
| 리뷰·검토 | docs/harness/review.md |
| 테스트·재현·검증 | docs/harness/testing.md |
| 빌드·배포·릴리스 | docs/harness/deployment.md |

설계 근거와 운영 시작 방법은 docs/harness/README.md를 참고한다.
