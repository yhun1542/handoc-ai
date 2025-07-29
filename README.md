# HanDoc AI
**문서를 이해하는 가장 빠른 방법**

## 📄 프로젝트 개요

HanDoc AI는 한글 PDF 문서를 업로드하면 AI가 자동으로 요약, 질문/답변 생성, 키워드 추출, 결과를 Markdown·PDF로 저장하고 ChatGPT로 연동까지 할 수 있는 멀티플랫폼 서비스입니다.

## 🎯 주요 기능

### 📤 문서 업로드
- 드래그앤드롭 + 파일 탐색기 + 모바일 카메라 업로드
- PDF 형식 지원

### 🤖 AI 분석
- OpenAI GPT-4/3.5 기반 3문단 요약
- 문서 기반 Q&A 자동 생성 (5개)
- 키워드 및 중요 문장 추출
- 텍스트 정제 및 보정

### 📥 결과 저장/공유
- Markdown, PDF, Text 형식 저장
- Google Drive 업로드
- ChatGPT 연동 복사
- Notion 연동 (예정)

### 🌐 멀티플랫폼 지원
- 웹 (React)
- Android (Kotlin + Jetpack Compose)
- iOS (SwiftUI)

### 🌍 다국어 지원
- 한국어/영어 UI
- 번역 옵션

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Android App    │    │    iOS App      │
│    (React)      │    │   (Kotlin)      │    │   (SwiftUI)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      FastAPI Backend     │
                    │       (Python)           │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │      External APIs       │
                    │  OpenAI | Google Drive   │
                    └───────────────────────────┘
```

## 🛠️ 기술 스택

### Frontend
- **Web**: React + TypeScript + Tailwind CSS + Zustand + i18next
- **Android**: Kotlin + Jetpack Compose
- **iOS**: SwiftUI

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **PDF Processing**: PyMuPDF, pdfplumber
- **AI**: OpenAI GPT-4/3.5
- **Text Processing**: kss, hanspell

### DevOps
- **Web Deploy**: Vercel/Netlify
- **Backend Deploy**: Railway/Render
- **Mobile Deploy**: Play Store, TestFlight
- **CI/CD**: GitHub Actions

## 📁 프로젝트 구조

```
handoc-ai/
├── backend/                 # FastAPI 백엔드
│   ├── app/
│   │   ├── api/            # API 라우터
│   │   ├── core/           # 설정, 보안
│   │   ├── models/         # 데이터 모델
│   │   ├── services/       # 비즈니스 로직
│   │   └── utils/          # 유틸리티
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # React 웹 앱
│   ├── src/
│   │   ├── components/     # 재사용 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── store/          # 상태 관리
│   │   ├── utils/          # 유틸리티
│   │   └── locales/        # 다국어 파일
│   ├── package.json
│   └── Dockerfile
├── mobile/
│   ├── android/            # Android 앱
│   └── ios/                # iOS 앱
├── docs/                   # 문서
│   ├── api.md             # API 명세서
│   ├── architecture.md    # 아키텍처 문서
│   └── deployment.md      # 배포 가이드
├── .github/
│   └── workflows/          # GitHub Actions
├── docker-compose.yml      # 로컬 개발 환경
└── README.md
```

## 🚀 빠른 시작

### 로컬 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/your-username/handoc-ai.git
cd handoc-ai

# Docker Compose로 전체 환경 실행
docker-compose up -d

# 또는 개별 실행
# 백엔드
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 프론트엔드
cd frontend
npm install
npm start
```

### 환경 변수 설정

```bash
# backend/.env
OPENAI_API_KEY=your_openai_api_key
GDRIVE_SERVICE_JSON=your_google_drive_service_json
DATABASE_URL=sqlite:///./handoc.db
SECRET_KEY=your_secret_key
```

## 📱 모바일 앱

### Android
- **최소 SDK**: 24 (Android 7.0)
- **타겟 SDK**: 34 (Android 14)
- **언어**: Kotlin
- **UI**: Jetpack Compose

### iOS
- **최소 버전**: iOS 15.0
- **언어**: Swift
- **UI**: SwiftUI

## 🔗 API 엔드포인트

### 문서 분석
- `POST /api/v1/analyze/pdf` - PDF 업로드 및 분석
- `GET /api/v1/analyze/{task_id}` - 분석 결과 조회
- `GET /api/v1/analyze/{task_id}/download` - 결과 파일 다운로드

### 사용자 관리 (선택적)
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `GET /api/v1/users/me` - 사용자 정보

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

- 프로젝트 링크: [https://github.com/your-username/handoc-ai](https://github.com/your-username/handoc-ai)
- 이슈 리포트: [https://github.com/your-username/handoc-ai/issues](https://github.com/your-username/handoc-ai/issues)

