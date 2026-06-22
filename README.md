# Netlify VOC Jira Site

Netlify에 바로 배포할 수 있도록 정리한 VOC Jira 이슈 작성 사이트다.  
브라우저에서 고객사명, 메모, 이미지 등을 입력하면:

1. OpenAI가 Jira 초안을 생성
2. 사용자가 초안을 확인
3. Netlify Function이 Jira API로 실제 이슈 등록

## 구성

- `public/`: 정적 사이트 파일
- `netlify/functions/`: Netlify Functions
- `netlify.toml`: 배포 설정
- `.env.example`: 필요한 환경 변수 예시

## 배포 방식

이 패키지는 **Netlify에 Git 저장소로 연결해서 배포하는 방식**을 권장한다.  
이유는 OpenAI 키와 Jira 토큰을 Netlify 환경 변수로 안전하게 넣어야 하기 때문이다.

## Netlify 배포 절차

1. 이 폴더 내용을 새 Git 저장소에 넣는다.
2. Netlify에서 해당 저장소를 Import 한다.
3. Build / Publish / Functions 설정은 `netlify.toml`을 그대로 사용한다.
4. Netlify 사이트 설정에서 Environment variables를 등록한다.
5. Deploy를 실행한다.

## Netlify에 넣어야 할 환경 변수

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
- `JIRA_PROJECT_KEY`
- `JIRA_ISSUE_TYPE`
- `JIRA_CUSTOMER_FIELD_ID`
- `JIRA_VOC_TYPE_FIELD_ID`
- `JIRA_VOC_TYPE_DEFECT_OPTION_ID`
- `JIRA_VOC_TYPE_IMPROVEMENT_OPTION_ID`
- `JIRA_VOC_TYPE_TECH_SUPPORT_OPTION_ID`
- `JIRA_VOC_TYPE_INQUIRY_OPTION_ID`


## 중요

- Netlify 클라우드 빌드는 로컬 `.env` 파일을 자동으로 읽지 않는다.
- 민감 정보는 Git 저장소에 커밋하지 말고 Netlify 환경 변수에만 넣는다.
- 현재 구현은 `customfield_10375`가 **텍스트 필드**라고 가정하고 고객사명을 문자열로 저장한다.
- 만약 고객사 필드가 선택형이라면 고객사 옵션 ID 매핑 로직을 추가해야 한다.

## 로컬 테스트

Netlify CLI가 있다면 아래처럼 로컬에서 테스트할 수 있다.

```bash
netlify dev
```

또는 Netlify 환경 변수와 동일한 값을 로컬 쉘 환경에 세팅한 뒤 실행한다.

## API 경로

- `POST /api/drafts`
- `POST /api/issues`
