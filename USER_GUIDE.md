# HanDoc AI 사용자 가이드

## 📖 목차
1. [시작하기](#시작하기)
2. [웹 애플리케이션 사용법](#웹-애플리케이션-사용법)
3. [모바일 앱 사용법](#모바일-앱-사용법)
4. [API 사용법](#api-사용법)
5. [문제 해결](#문제-해결)
6. [자주 묻는 질문](#자주-묻는-질문)

## 🚀 시작하기

### HanDoc AI란?
HanDoc AI는 한글 PDF 문서를 AI가 자동으로 분석하여 요약, 질문/답변 생성, 키워드 추출을 제공하는 멀티플랫폼 서비스입니다.

### 주요 기능
- 📄 **PDF 문서 업로드**: 드래그앤드롭으로 간편 업로드
- 🤖 **AI 자동 분석**: GPT-4 기반 지능형 문서 분석
- 📝 **3문단 요약**: 핵심 내용을 간결하게 정리
- ❓ **Q&A 생성**: 문서 내용 기반 질문과 답변 자동 생성
- 🔍 **키워드 추출**: 중요도별 키워드 15개 추출
- 💡 **중요 문장**: 핵심 문장 8개 하이라이트
- 📤 **다양한 내보내기**: Markdown, PDF, TXT 형식 지원
- ☁️ **클라우드 연동**: Google Drive, Notion 연동

### 지원 플랫폼
- 🌐 **웹**: https://handoc.ai
- 📱 **Android**: Google Play Store
- 🍎 **iOS**: App Store

## 🌐 웹 애플리케이션 사용법

### 1. 회원가입 및 로그인

#### 회원가입
1. https://handoc.ai 접속
2. "회원가입" 버튼 클릭
3. 필수 정보 입력:
   - 사용자명
   - 이메일 주소
   - 비밀번호 (8자 이상, 대소문자, 숫자, 특수문자 포함)
   - 실명 (선택)
4. 이용약관 및 개인정보처리방침 동의
5. "계정 만들기" 버튼 클릭

#### 로그인
1. 이메일과 비밀번호 입력
2. "로그인" 버튼 클릭
3. 또는 Google/GitHub 소셜 로그인 사용

### 2. 문서 업로드

#### 지원 파일 형식
- **PDF 파일만 지원**
- **최대 크기**: 10MB
- **언어**: 한국어, 영어

#### 업로드 방법
1. 대시보드에서 "새 문서 업로드" 버튼 클릭
2. 파일 선택 또는 드래그앤드롭
3. 업로드 진행률 확인
4. 자동으로 분석 시작

### 3. 분석 결과 확인

#### 분석 과정
1. **텍스트 추출**: PDF에서 텍스트 추출
2. **텍스트 정제**: 불필요한 문자 제거 및 정리
3. **AI 분석**: GPT-4를 사용한 내용 분석
4. **결과 생성**: 요약, Q&A, 키워드 생성

#### 결과 화면 구성
- **📊 개요**: 문서 기본 정보 (페이지 수, 단어 수 등)
- **📝 요약**: 3문단으로 구성된 핵심 요약
- **❓ Q&A**: 5개의 질문과 답변 쌍
- **🔍 키워드**: 중요도순 15개 키워드
- **💡 중요 문장**: 핵심 문장 8개

### 4. 결과 내보내기

#### 지원 형식
- **Markdown (.md)**: 텍스트 편집기에서 사용
- **PDF (.pdf)**: 인쇄 및 공유용
- **텍스트 (.txt)**: 단순 텍스트 형식
- **JSON (.json)**: 개발자용 구조화된 데이터

#### 내보내기 방법
1. 분석 결과 페이지에서 "내보내기" 버튼 클릭
2. 원하는 형식 선택
3. 다운로드 또는 클라우드 저장

### 5. 클라우드 연동

#### Google Drive 연동
1. 설정 페이지에서 "Google Drive 연결" 클릭
2. Google 계정 인증
3. 분석 결과를 자동으로 Drive에 저장

#### Notion 연동 (준비 중)
- 향후 업데이트에서 지원 예정

## 📱 모바일 앱 사용법

### Android 앱

#### 설치
1. Google Play Store에서 "HanDoc AI" 검색
2. 앱 설치
3. 계정 로그인 또는 회원가입

#### 주요 기능
- **카메라 스캔**: 문서를 카메라로 촬영하여 PDF 생성
- **파일 업로드**: 갤러리에서 PDF 파일 선택
- **오프라인 캐시**: 분석 결과 오프라인 조회
- **푸시 알림**: 분석 완료 알림

### iOS 앱

#### 설치
1. App Store에서 "HanDoc AI" 검색
2. 앱 설치
3. 계정 로그인 또는 회원가입

#### 주요 기능
- **문서 스캔**: iOS 내장 스캐너 활용
- **Files 앱 연동**: iCloud Drive, Dropbox 등 연동
- **Siri 단축어**: 음성으로 앱 실행
- **위젯**: 홈 화면에서 빠른 접근

## 🔧 API 사용법

### 인증

#### 토큰 발급
```bash
curl -X POST "https://api.handoc.ai/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=your@email.com&password=yourpassword"
```

#### 응답
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### 문서 업로드

```bash
curl -X POST "https://api.handoc.ai/api/v1/documents/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

### 분석 결과 조회

```bash
curl -X GET "https://api.handoc.ai/api/v1/analyses/document/{document_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Python SDK 예제

```python
import requests

class HanDocClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.handoc.ai/api/v1"
        self.headers = {"Authorization": f"Bearer {api_key}"}
    
    def upload_document(self, file_path):
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(
                f"{self.base_url}/documents/upload",
                files=files,
                headers=self.headers
            )
        return response.json()
    
    def get_analysis(self, document_id):
        response = requests.get(
            f"{self.base_url}/analyses/document/{document_id}",
            headers=self.headers
        )
        return response.json()

# 사용 예제
client = HanDocClient("your_api_token")
result = client.upload_document("document.pdf")
analysis = client.get_analysis(result["document"]["id"])
```

## 🔧 문제 해결

### 일반적인 문제

#### 1. 파일 업로드 실패
**증상**: "파일 업로드에 실패했습니다" 오류
**해결방법**:
- 파일 크기가 10MB 이하인지 확인
- PDF 파일 형식인지 확인
- 인터넷 연결 상태 확인
- 브라우저 캐시 삭제 후 재시도

#### 2. 분석 처리 지연
**증상**: 분석이 오래 걸리거나 멈춤
**해결방법**:
- 일반적으로 1-3분 소요 (문서 크기에 따라 다름)
- 페이지를 새로고침하지 말고 대기
- 5분 이상 지연 시 고객지원 문의

#### 3. 로그인 문제
**증상**: 로그인이 되지 않음
**해결방법**:
- 이메일과 비밀번호 정확성 확인
- 비밀번호 재설정 시도
- 소셜 로그인 사용
- 쿠키 및 캐시 삭제

#### 4. 분석 결과 품질 문제
**증상**: 요약이나 키워드가 부정확함
**해결방법**:
- 문서의 텍스트 품질 확인 (스캔된 이미지 PDF는 정확도 낮음)
- 한국어 문서 권장
- 구조화된 문서 사용 (제목, 단락 구분 명확)

### 브라우저별 문제

#### Chrome
- 팝업 차단 해제
- 쿠키 허용 설정

#### Safari
- 추적 방지 기능 일시 해제
- 쿠키 설정 확인

#### Firefox
- 향상된 추적 방지 해제
- JavaScript 활성화 확인

### 모바일 앱 문제

#### Android
- 앱 권한 확인 (저장소, 카메라)
- Google Play 서비스 업데이트
- 앱 캐시 삭제

#### iOS
- 앱 권한 확인 (사진, 카메라)
- iOS 버전 16.0 이상 필요
- 앱 재설치

## ❓ 자주 묻는 질문

### 서비스 관련

**Q: HanDoc AI는 무료인가요?**
A: 기본 서비스는 무료이며, 월 50개 문서까지 분석 가능합니다. 프리미엄 플랜은 무제한 분석과 추가 기능을 제공합니다.

**Q: 어떤 언어를 지원하나요?**
A: 현재 한국어와 영어를 지원합니다. 한국어 문서에서 최고의 성능을 발휘합니다.

**Q: 분석 시간은 얼마나 걸리나요?**
A: 일반적으로 1-3분 소요되며, 문서 크기와 복잡도에 따라 달라집니다.

**Q: 업로드한 문서는 안전한가요?**
A: 모든 문서는 암호화되어 저장되며, 분석 완료 후 30일 후 자동 삭제됩니다.

### 기술적 질문

**Q: API 사용량 제한이 있나요?**
A: 무료 계정은 시간당 10회, 일일 50회 제한이 있습니다. 프리미엄 계정은 더 높은 한도를 제공합니다.

**Q: 스캔된 PDF도 분석 가능한가요?**
A: 텍스트가 포함된 PDF만 분석 가능합니다. 이미지만 있는 스캔 PDF는 OCR 기능을 통해 텍스트 추출 후 분석합니다.

**Q: 분석 결과를 수정할 수 있나요?**
A: 현재는 자동 생성된 결과만 제공하며, 향후 업데이트에서 편집 기능을 추가할 예정입니다.

### 계정 및 결제

**Q: 계정을 삭제하려면 어떻게 하나요?**
A: 설정 페이지에서 "계정 삭제" 또는 고객지원으로 문의해주세요.

**Q: 프리미엄 플랜의 혜택은 무엇인가요?**
A: 무제한 문서 분석, 우선 처리, 고급 내보내기 옵션, 클라우드 연동 등을 제공합니다.

**Q: 환불 정책은 어떻게 되나요?**
A: 구독 후 7일 이내 전액 환불 가능하며, 이후에는 사용량에 따라 부분 환불됩니다.

## 📞 고객 지원

### 연락처
- **이메일**: support@handoc.ai
- **채팅**: 웹사이트 우하단 채팅 버튼
- **전화**: 1588-1234 (평일 9-18시)

### 온라인 자료
- **도움말 센터**: https://help.handoc.ai
- **API 문서**: https://docs.handoc.ai
- **개발자 가이드**: https://dev.handoc.ai
- **커뮤니티**: https://community.handoc.ai

### 피드백
서비스 개선을 위한 의견이나 제안사항이 있으시면 언제든 연락해주세요. 여러분의 피드백이 HanDoc AI를 더 나은 서비스로 만듭니다.

---

**마지막 업데이트**: 2024년 1월
**버전**: 1.0.0

