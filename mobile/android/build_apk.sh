#!/bin/bash

# HanDoc AI Android 앱 빌드 스크립트
# 이 스크립트는 Android Studio 또는 Gradle을 사용하여 APK를 빌드합니다.

echo "🚀 HanDoc AI Android 앱 빌드 시작..."

# 프로젝트 디렉토리로 이동
cd "$(dirname "$0")"

# Gradle Wrapper 실행 권한 부여
if [ -f "./gradlew" ]; then
    chmod +x ./gradlew
    echo "✅ Gradle Wrapper 권한 설정 완료"
else
    echo "❌ gradlew 파일을 찾을 수 없습니다. Android Studio에서 프로젝트를 열어주세요."
    exit 1
fi

# 의존성 다운로드 및 빌드
echo "📦 의존성 다운로드 중..."
./gradlew clean

echo "🔨 Debug APK 빌드 중..."
./gradlew assembleDebug

echo "🔨 Release APK 빌드 중..."
./gradlew assembleRelease

# 빌드 결과 확인
if [ -f "./app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ Debug APK 빌드 성공!"
    echo "📱 파일 위치: ./app/build/outputs/apk/debug/app-debug.apk"
fi

if [ -f "./app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    echo "✅ Release APK 빌드 성공!"
    echo "📱 파일 위치: ./app/build/outputs/apk/release/app-release-unsigned.apk"
fi

echo "🎉 Android 앱 빌드 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. APK 파일을 실제 Android 기기에서 테스트"
echo "2. Google Play Console에서 앱 등록"
echo "3. 서명된 APK 또는 AAB 파일 업로드"
echo "4. 스토어 리스팅 정보 작성"

