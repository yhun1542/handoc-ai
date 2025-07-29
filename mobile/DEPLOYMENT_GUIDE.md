# 📱 HanDoc AI 모바일 앱 배포 가이드

## 🎯 개요

HanDoc AI 모바일 앱을 Android Play Store와 iOS App Store에 배포하기 위한 완전한 가이드입니다.

## 🤖 Android 앱 배포

### 📋 사전 준비사항

1. **Google Play Console 계정**
   - Google Play Console 개발자 등록 ($25 일회성 수수료)
   - https://play.google.com/console

2. **Android Studio 설치**
   - 최신 버전의 Android Studio
   - Android SDK 및 빌드 도구

3. **앱 서명 키 생성**
   ```bash
   keytool -genkey -v -keystore handoc-ai-release-key.keystore -alias handoc-ai -keyalg RSA -keysize 2048 -validity 10000
   ```

### 🔨 빌드 과정

1. **프로젝트 설정**
   ```bash
   cd /path/to/handoc-ai/mobile/android
   ./build_apk.sh
   ```

2. **Release APK 생성**
   - `app/build.gradle`에서 서명 설정
   - `./gradlew assembleRelease` 실행
   - 서명된 APK 생성 확인

3. **AAB (Android App Bundle) 생성**
   ```bash
   ./gradlew bundleRelease
   ```

### 📱 Play Store 업로드

1. **앱 등록**
   - Google Play Console에서 새 앱 생성
   - 앱 이름: "HanDoc AI"
   - 패키지명: `ai.handoc.mobile`

2. **스토어 리스팅**
   - **앱 제목**: HanDoc AI - 문서 분석 도우미
   - **짧은 설명**: AI로 PDF 문서를 빠르게 요약하고 분석하세요
   - **전체 설명**: 
     ```
     HanDoc AI는 한글 PDF 문서를 AI가 자동으로 분석하여 
     요약, 질문/답변 생성, 키워드 추출을 제공하는 혁신적인 앱입니다.
     
     🔥 주요 기능:
     • 📄 PDF 자동 텍스트 추출
     • 🤖 GPT-4 기반 3문단 요약
     • ❓ 자동 Q&A 생성
     • 🔑 핵심 키워드 추출
     • 💾 다양한 형식으로 저장
     • 🌐 웹과 모바일 동기화
     ```

3. **스크린샷 및 미디어**
   - 스마트폰 스크린샷 (최소 2개, 최대 8개)
   - 태블릿 스크린샷 (선택사항)
   - 앱 아이콘 (512x512 PNG)

4. **앱 콘텐츠 등급**
   - 대상 연령: 모든 연령
   - 콘텐츠 등급 설문 완료

5. **개인정보 처리방침**
   - 개인정보 처리방침 URL 제공
   - 데이터 수집 및 사용 목적 명시

### 🚀 출시 과정

1. **내부 테스트**
   - AAB 파일 업로드
   - 내부 테스터 그룹 생성
   - 기능 테스트 완료

2. **비공개 테스트**
   - 제한된 사용자 그룹 테스트
   - 피드백 수집 및 개선

3. **공개 테스트**
   - 오픈 베타 또는 비공개 베타
   - 더 넓은 사용자 그룹 테스트

4. **프로덕션 출시**
   - 최종 검토 및 승인
   - 전 세계 사용자에게 공개

## 🍎 iOS 앱 배포

### 📋 사전 준비사항

1. **Apple Developer 계정**
   - Apple Developer Program 등록 ($99/년)
   - https://developer.apple.com

2. **Xcode 설치**
   - macOS 환경 필수
   - 최신 버전의 Xcode

3. **인증서 및 프로비저닝 프로필**
   - Development Certificate
   - Distribution Certificate
   - App Store Provisioning Profile

### 🔨 빌드 과정

1. **Xcode 프로젝트 설정**
   ```bash
   cd /path/to/handoc-ai/mobile/ios
   open HanDocAI.xcodeproj
   ```

2. **Bundle Identifier 설정**
   - `ai.handoc.mobile` 또는 고유한 식별자
   - Apple Developer 계정에서 App ID 등록

3. **서명 설정**
   - Signing & Capabilities 탭
   - Team 선택 및 자동 서명 활성화

4. **Archive 빌드**
   - Product → Archive 메뉴 실행
   - Organizer에서 Archive 확인

### 📱 App Store 업로드

1. **App Store Connect 설정**
   - https://appstoreconnect.apple.com
   - 새 앱 생성

2. **앱 정보**
   - **이름**: HanDoc AI
   - **부제목**: 문서를 이해하는 가장 빠른 방법
   - **카테고리**: 생산성
   - **설명**:
     ```
     HanDoc AI는 한글 PDF 문서를 AI가 자동으로 분석하여 
     요약, 질문/답변 생성, 키워드 추출을 제공하는 혁신적인 앱입니다.
     
     주요 기능:
     • PDF 자동 텍스트 추출
     • GPT-4 기반 3문단 요약  
     • 자동 Q&A 생성
     • 핵심 키워드 추출
     • 다양한 형식으로 저장
     • 웹과 모바일 동기화
     ```

3. **스크린샷 및 미디어**
   - iPhone 스크린샷 (6.7", 6.5", 5.5" 디스플레이)
   - iPad 스크린샷 (12.9", 11" 디스플레이)
   - 앱 미리보기 비디오 (선택사항)

4. **TestFlight 베타 테스트**
   - Archive에서 TestFlight로 업로드
   - 내부 테스터 초대
   - 외부 테스터 그룹 생성

### 🚀 출시 과정

1. **심사 제출**
   - 모든 정보 입력 완료
   - 심사용 빌드 선택
   - 심사 제출

2. **심사 과정**
   - Apple 심사팀 검토 (1-7일)
   - 거부 시 수정 후 재제출
   - 승인 시 출시 준비 완료

3. **앱 스토어 출시**
   - 수동 출시 또는 자동 출시 선택
   - 전 세계 iOS 사용자에게 공개

## 📊 배포 후 관리

### 📈 성과 추적

1. **Google Play Console**
   - 다운로드 수, 평점, 리뷰 모니터링
   - 충돌 보고서 및 ANR 분석
   - 사용자 피드백 관리

2. **App Store Connect**
   - 다운로드 수, 평점, 리뷰 모니터링
   - 충돌 보고서 분석
   - 사용자 피드백 관리

### 🔄 업데이트 관리

1. **버전 관리**
   - 의미 있는 버전 번호 사용 (예: 1.0.0)
   - 변경 사항 로그 작성
   - 정기적인 업데이트 배포

2. **사용자 소통**
   - 업데이트 노트 작성
   - 사용자 리뷰에 응답
   - 피드백 기반 개선

## 🛠️ 문제 해결

### 일반적인 문제들

1. **빌드 오류**
   - 의존성 버전 충돌
   - 서명 인증서 문제
   - 권한 설정 오류

2. **심사 거부**
   - 가이드라인 위반
   - 메타데이터 불일치
   - 기능 동작 오류

3. **성능 문제**
   - 앱 크기 최적화
   - 메모리 사용량 관리
   - 배터리 효율성 개선

## 📞 지원 및 문의

- **개발팀 이메일**: dev@handoc.ai
- **사용자 지원**: support@handoc.ai
- **GitHub 저장소**: https://github.com/yhun1542/handoc-ai

---

**🎉 HanDoc AI 모바일 앱 배포 가이드 완료!**

이 가이드를 따라 Android와 iOS 앱을 성공적으로 배포하세요.

