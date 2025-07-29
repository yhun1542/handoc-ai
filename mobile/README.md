# HanDoc AI Mobile Apps

HanDoc AI의 Android 및 iOS 모바일 애플리케이션입니다.

## 📱 지원 플랫폼

### Android
- **최소 버전**: Android 7.0 (API 24)
- **타겟 버전**: Android 14 (API 34)
- **아키텍처**: ARM64, x86_64
- **언어**: Kotlin
- **UI 프레임워크**: Jetpack Compose

### iOS
- **최소 버전**: iOS 16.0
- **타겟 버전**: iOS 17.0
- **아키텍처**: ARM64 (Apple Silicon)
- **언어**: Swift
- **UI 프레임워크**: SwiftUI

## 🚀 주요 기능

### 📄 문서 처리
- PDF 파일 업로드 (최대 10MB)
- 드래그앤드롭 지원
- 카메라로 문서 스캔
- 실시간 업로드 진행률 표시

### 🤖 AI 분석
- GPT-4 기반 문서 요약
- 자동 Q&A 생성
- 키워드 추출
- 중요 문장 하이라이트

### 📊 결과 관리
- 분석 결과 조회
- Markdown/PDF 내보내기
- 클라우드 동기화
- 오프라인 캐싱

### 🔐 사용자 관리
- 이메일/비밀번호 인증
- 소셜 로그인 (Google, Apple)
- 프리미엄 구독 관리
- 사용량 추적

## 🏗️ 아키텍처

### Android
```
app/
├── data/           # 데이터 레이어
│   ├── api/        # API 클라이언트
│   ├── local/      # 로컬 데이터베이스
│   └── repository/ # 리포지토리 패턴
├── domain/         # 도메인 레이어
│   ├── model/      # 도메인 모델
│   ├── repository/ # 리포지토리 인터페이스
│   └── usecase/    # 비즈니스 로직
├── presentation/   # 프레젠테이션 레이어
│   ├── ui/         # Compose UI
│   ├── viewmodel/  # ViewModel
│   └── navigation/ # 네비게이션
└── di/             # 의존성 주입
```

### iOS
```
HanDocAI/
├── Data/           # 데이터 레이어
│   ├── API/        # API 클라이언트
│   ├── Local/      # Core Data
│   └── Repository/ # 리포지토리 패턴
├── Domain/         # 도메인 레이어
│   ├── Model/      # 도메인 모델
│   ├── Repository/ # 리포지토리 프로토콜
│   └── UseCase/    # 비즈니스 로직
├── Presentation/   # 프레젠테이션 레이어
│   ├── Views/      # SwiftUI Views
│   ├── ViewModels/ # ObservableObject
│   └── Navigation/ # 네비게이션
└── DI/             # 의존성 주입
```

## 🛠️ 개발 환경 설정

### Android 개발 환경

#### 필요 도구
- Android Studio Hedgehog (2023.1.1) 이상
- JDK 17
- Android SDK 34
- Kotlin 1.9.10

#### 프로젝트 설정
```bash
# 저장소 클론
git clone https://github.com/handoc-ai/handoc-ai.git
cd handoc-ai/mobile/android

# 의존성 설치
./gradlew build

# 앱 실행
./gradlew installDebug
```

#### 환경 변수
```properties
# local.properties
API_BASE_URL_DEBUG=http://10.0.2.2:8000
API_BASE_URL_RELEASE=https://api.handoc.ai
```

### iOS 개발 환경

#### 필요 도구
- Xcode 15.0 이상
- iOS 16.0 SDK
- Swift 5.9
- CocoaPods 또는 Swift Package Manager

#### 프로젝트 설정
```bash
# 저장소 클론
git clone https://github.com/handoc-ai/handoc-ai.git
cd handoc-ai/mobile/ios

# Xcode에서 프로젝트 열기
open HanDocAI.xcodeproj
```

#### 환경 변수
```swift
// Config.swift
#if DEBUG
let API_BASE_URL = "http://localhost:8000"
#else
let API_BASE_URL = "https://api.handoc.ai"
#endif
```

## 🧪 테스트

### Android 테스트
```bash
# 단위 테스트
./gradlew test

# UI 테스트
./gradlew connectedAndroidTest

# 코드 커버리지
./gradlew jacocoTestReport
```

### iOS 테스트
```bash
# 단위 테스트
xcodebuild test -scheme HanDocAI -destination 'platform=iOS Simulator,name=iPhone 15'

# UI 테스트
xcodebuild test -scheme HanDocAIUITests -destination 'platform=iOS Simulator,name=iPhone 15'
```

## 📦 빌드 및 배포

### Android 배포

#### 디버그 빌드
```bash
./gradlew assembleDebug
```

#### 릴리즈 빌드
```bash
./gradlew assembleRelease
```

#### Play Store 업로드
```bash
./gradlew bundleRelease
```

### iOS 배포

#### 디버그 빌드
```bash
xcodebuild -scheme HanDocAI -configuration Debug
```

#### 릴리즈 빌드
```bash
xcodebuild -scheme HanDocAI -configuration Release
```

#### App Store 업로드
```bash
xcodebuild -scheme HanDocAI archive -archivePath HanDocAI.xcarchive
xcodebuild -exportArchive -archivePath HanDocAI.xcarchive -exportPath . -exportOptionsPlist ExportOptions.plist
```

## 🔧 설정

### API 설정
- **개발 환경**: `http://localhost:8000`
- **프로덕션**: `https://api.handoc.ai`
- **API 버전**: `v1`

### 파일 업로드 제한
- **최대 크기**: 10MB
- **지원 형식**: PDF
- **동시 업로드**: 3개

### 캐시 설정
- **이미지 캐시**: 100MB
- **API 캐시**: 50MB
- **문서 캐시**: 200MB

## 🐛 디버깅

### Android 디버깅
```bash
# 로그 확인
adb logcat -s HanDocAI

# 네트워크 트래픽 모니터링
adb shell am start -n com.android.settings/.DevelopmentSettings
```

### iOS 디버깅
```bash
# 시뮬레이터 로그
xcrun simctl spawn booted log stream --predicate 'subsystem contains "ai.handoc.mobile"'

# 디바이스 로그
idevicesyslog -u [UDID]
```

## 📚 문서

- [API 문서](../docs/api.md)
- [아키텍처 가이드](../docs/architecture.md)
- [UI/UX 가이드라인](../docs/design.md)
- [배포 가이드](../docs/deployment.md)

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

- **이메일**: support@handoc.ai
- **문서**: https://docs.handoc.ai
- **이슈 트래커**: https://github.com/handoc-ai/handoc-ai/issues

