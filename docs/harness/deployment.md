# 배포

현재 배포 경로는 EAS Build이다. `preview`는 내부 배포, `production`은 스토어용 바이너리 생성이다. production 빌드 성공은 스토어 제출이나 공개 완료가 아니다. EAS Update는 구성되어 있지 않다.

## 최초 설정

1. GitHub에 `preview`, `production` environments를 만든다. 각 환경에 권한이 제한된 `EXPO_TOKEN` secret을 등록한다.
2. production 환경에는 실제 기본 브랜치/릴리스 태그 제한과 가능한 플랜에서 required reviewers를 설정한다. YAML만으로 이 설정이 적용되지는 않는다.
3. 기본 브랜치 보호에 CI의 `verify` 검사를 필수로 설정한다.
4. EAS 프로젝트 ID/owner와 Android package/iOS bundleIdentifier가 실제 배포 대상인지 확인한다. 기존 식별자를 임의로 바꾸지 않는다.
5. 각 플랫폼 첫 빌드와 서명 자격 증명 설정을 계정 소유자가 완료한다. CI는 비대화형이므로 미설정 상태에서 실패한다.

## 실행

1. 커밋, 플랫폼(android/ios), 프로필(preview/production)을 확정한다. testing.md의 관련 검사 결과와 미해결 결함을 검토한다.
2. GitHub Actions의 `EAS Build`를 선택한 ref에서 수동 실행한다. 자동 검증이 먼저 통과해야 빌드가 시작된다.
3. 워크플로는 빌드 완료를 기다린다. 실패하면 EAS 로그를 확인하고 같은 문제를 해결하지 않은 채 반복 제출하지 않는다.
4. preview 바이너리를 테스트 기기에 설치해 주요 흐름과 업그레이드를 검증한다.
5. production 바이너리는 별도 스토어 제출 요청이 있을 때만 제출한다. `latest` 대신 확인한 빌드 ID를 사용한다: `npx eas-cli@18.13.0 submit --platform android --id BUILD_ID --profile production` (iOS는 플랫폼 변경).
6. 제출 후에도 스토어 처리·심사·공개 상태를 확인해야 배포 완료로 보고한다.

## 릴리스 기록

PR/릴리스 설명에 커밋 SHA, 앱 버전, 플랫폼/프로필, EAS 빌드 ID·URL, 검사 결과, 기기 smoke test, 남은 결함, 제출/공개 상태를 남긴다. 토큰과 서명 파일은 포함하지 않는다.

## 실패·복구

JS export나 테스트 실패는 빌드를 차단한다. 네이티브 빌드 실패는 EAS 로그로 분류한다. 출시 후 오류는 단계적 공개를 중단하고 수정 버전을 새 빌드 번호로 배포한다. 스토어 앱을 단순히 이전 바이너리로 되돌릴 수 있다고 가정하지 않는다. SQLite 마이그레이션은 데이터 보존이 우선이며 운영 DB를 삭제하거나 user_version을 내리지 않는다.
