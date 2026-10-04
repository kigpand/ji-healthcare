# 프로젝트 하네스

2026-09-19 기준 공식 문서를 참고한 이 프로젝트의 운영 규약이다. 단일한 업계 표준이나 가장 보편적인 제품이라는 주장은 하지 않는다. 저장소 지침, 역할별 절차, 재현 가능한 검사, CI, 명시적 릴리스 실행을 조합한다.

## 시작

1. `.nvmrc`의 Node 버전을 사용하고 `npm ci`를 실행한다.
2. `npm run check`로 린트·타입·단위 테스트를 확인한다.
3. `npm run build:check`로 Android/iOS JS 번들을 검증한다. 네이티브 빌드 성공을 의미하지 않는다.
4. AGENTS.md에서 요청에 해당하는 절차를 읽고 작업한다.

예: “개발 절차에 따라 카테고리 편집 버그를 수정해줘”, “리뷰 절차에 따라 현재 변경을 검토해줘”, “테스트 절차에 따라 휴식 타이머를 검증해줘”, “배포 절차에 따라 Android preview 빌드를 준비해줘”.

## 구성과 완료 기준

| 역할 | 입력 | 결과 |
| --- | --- | --- |
| 개발 | 요구사항·재현 단계 | 최소 변경과 검증 결과 |
| 리뷰 | 비교 기준·변경 범위 | 근거가 있는 우선순위별 발견 사항 |
| 테스트 | 변경 영향·기대 동작 | 자동 검사와 기기 검증 증거 |
| 배포 | 커밋·플랫폼·프로필 | 검증된 EAS 빌드와 릴리스 기록 |

CI는 PR 및 push에서 동일한 검사와 모바일 JS 번들 생성을 수행한다. 테스트 커버리지는 관찰 자료로 저장하며, 초기 단계에 임의의 전역 커버리지 수치를 통과 기준으로 삼지 않는다. 실패를 확인하고 최소 수정 후 관련 검사를 재실행한다. 환경·권한 장애는 제품 버그와 별도로 기록한다.

## 현재 한계와 알려진 문제

- 자동 테스트는 입력 검증, 날짜 경계, 기록 저장, 화면 이탈, 휴식 타이머, SQLite 마이그레이션과 AI Worker 계약을 검증한다. 실제 기기 SQLite, 알림, 화면 조작 E2E는 아직 자동화되어 있지 않다.
- 카테고리 선택 복원, 소수점 무게 입력, 백그라운드 휴식 시간 문제는 수정하고 회귀 테스트를 추가했다. 실제 기기 동작은 testing.md의 시나리오로 계속 검증한다.
- CI 설정 파일만으로 GitHub branch protection이나 environment 보호가 활성화되지는 않는다. deployment.md의 저장소 설정을 적용해야 한다.
- EAS 계정·서명 자격 증명과 실제 기기 동작은 로컬 정적 검사로 보장되지 않는다.
- Expo 57 업그레이드 이후 현재 lockfile을 기준으로 의존성 보안 영향을 다시 분류해야 한다. 호환성을 깨뜨릴 수 있는 자동 강제 업그레이드는 수행하지 않는다.

## 최근 검증 결과

2026-10-04 로컬 검증: Node 22.17.0에서 DB v7 마이그레이션과 운동 중 세트 구성·수행 기록을 포함한 린트·타입 검사 통과, Jest 20개 suite / 134개 테스트 통과, Android/iOS JS export 통과.

2026-10-03 iOS Simulator 검증: iOS 26.5의 iPhone 17 Pro에서 Debug 네이티브 빌드·설치·실행에 성공했다. 데이터가 비어 있는 Simulator에 v3 fixture를 준비하고 앱을 재설치하지 않은 채 실행해 v5까지의 업그레이드를 확인했다. 기존 카테고리 1건, 루틴 1건, 운동 항목 2건, 기록 1건, AI 설정을 보존했고, `NULL`과 0이던 세트 수는 1로 보정됐으며 `record_items` 테이블이 생성됐다. `PRAGMA foreign_key_check` 위반은 없었다. v6·v7 네이티브 마이그레이션은 아직 Simulator에서 검증하지 않았다.

개발 클라이언트 최초 안내로 화면 자동 조작이 제한되어 운동 완료 저장, 접근성 글꼴, 알림, 백그라운드 복귀 시나리오는 이번 실행에서 확인하지 못했다. GitHub CI, EAS 네이티브 빌드, 실제 기기 검증은 별도 실행 결과로 관리한다.

## 참조

- [OpenAI AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md): 저장소별 지침과 좁은 문서 진입점.
- [Expo Jest](https://docs.expo.dev/develop/unit-testing/): Expo SDK에 맞는 jest-expo preset.
- [GitHub Node CI](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs): lockfile 기반 설치와 동일한 로컬/CI 명령.
- [Expo EAS CI](https://docs.expo.dev/build/building-on-ci/): 토큰 기반 인증과 빌드 완료 대기.
- [GitHub environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments): 환경별 자격 증명과 배포 보호.
