#!/bin/bash

# HanDoc AI iOS 앱 빌드 스크립트
# 이 스크립트는 Xcode를 사용하여 iOS 앱을 빌드합니다.

echo "🍎 HanDoc AI iOS 앱 빌드 시작..."

# 프로젝트 디렉토리로 이동
cd "$(dirname "$0")"

# Xcode 프로젝트 확인
if [ -f "./HanDocAI.xcodeproj/project.pbxproj" ]; then
    echo "✅ Xcode 프로젝트 파일 확인됨"
else
    echo "❌ Xcode 프로젝트 파일을 찾을 수 없습니다."
    exit 1
fi

echo "📋 iOS 앱 빌드 가이드:"
echo ""
echo "🔧 필수 요구사항:"
echo "- macOS 환경"
echo "- Xcode 14.0 이상"
echo "- iOS 16.0 이상 타겟"
echo "- Apple Developer 계정"
echo ""
echo "📱 빌드 단계:"
echo "1. Xcode에서 HanDocAI.xcodeproj 열기"
echo "2. 개발자 계정 설정 (Signing & Capabilities)"
echo "3. Bundle Identifier 설정 (예: com.handoc.ai)"
echo "4. 시뮬레이터 또는 실제 기기에서 테스트"
echo "5. Archive 빌드 생성"
echo ""
echo "🚀 배포 단계:"
echo "1. App Store Connect에서 앱 등록"
echo "2. TestFlight 베타 테스트"
echo "3. App Store 심사 제출"
echo "4. 앱 스토어 출시"
echo ""
echo "📄 필요한 파일들:"
echo "- 앱 아이콘 (1024x1024)"
echo "- 스크린샷 (다양한 기기 크기)"
echo "- 앱 설명 및 키워드"
echo "- 개인정보 처리방침"

# SwiftUI 프로젝트 구조 확인
echo ""
echo "📁 현재 프로젝트 구조:"
find . -name "*.swift" -type f | head -10

echo ""
echo "✅ iOS 빌드 가이드 완료!"
echo "💡 실제 빌드는 macOS 환경에서 Xcode를 사용해주세요."

