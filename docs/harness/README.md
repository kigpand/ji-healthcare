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

- 초기 자동 테스트는 스키마·날짜·영상 URL을 검증한다. SQLite 기기 통합, 알림, 화면 조작 E2E는 아직 자동화되어 있지 않다.
- 이전 리뷰의 카테고리 선택 복원, 소수점 무게 입력, 백그라운드 휴식 시간 문제는 이번 하네스 구성에서 수정하지 않는다. testing.md의 회귀 시나리오로 추적한다.
- 로컬 Xcode 라이선스 미동의로 Git/네이티브 명령이 실패한 이력이 있다. 사용자가 라이선스를 검토하고 개발 환경을 정상화해야 한다.
- CI 설정 파일만으로 GitHub branch protection이나 environment 보호가 활성화되지는 않는다. deployment.md의 저장소 설정을 적용해야 한다.
- EAS 계정·서명 자격 증명과 실제 기기 동작은 로컬 정적 검사로 보장되지 않는다.
- 최초 의존성 설치의 npm audit 요약은 47건(low 1, moderate 22, high 22, critical 2)을 보고했다. 기존/신규 의존성 기여도와 런타임 영향은 아직 분류하지 않았으며, 배포 전 별도 검토가 필요하다. 호환성을 깨뜨릴 수 있는 자동 강제 업그레이드는 수행하지 않았다.

## 최초 검증 결과

2026-09-19 로컬 검증: 린트·타입 검사 통과, Jest 3개 suite / 19개 테스트 통과, Android/iOS JS export 통과. 커버리지 수집 대상의 statement coverage는 11.4%로 초기 기반 수준이다. GitHub 원격 실행과 EAS 네이티브 빌드·스토어 제출은 실행하지 않았다.

## 참조

- [OpenAI AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md): 저장소별 지침과 좁은 문서 진입점.
- [Expo Jest](https://docs.expo.dev/develop/unit-testing/): Expo SDK에 맞는 jest-expo preset.
- [GitHub Node CI](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs): lockfile 기반 설치와 동일한 로컬/CI 명령.
- [Expo EAS CI](https://docs.expo.dev/build/building-on-ci/): 토큰 기반 인증과 빌드 완료 대기.
- [GitHub environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments): 환경별 자격 증명과 배포 보호.
