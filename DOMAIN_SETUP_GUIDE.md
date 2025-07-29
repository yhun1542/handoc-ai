# 🌐 HanDoc AI 커스텀 도메인 설정 가이드

## 🎯 개요

HanDoc AI 웹사이트에 커스텀 도메인을 연결하여 더 전문적인 브랜드 이미지를 구축하는 방법을 안내합니다.

현재 상태: `handoc-ai.vercel.app` → 커스텀 도메인 (예: `handoc.ai`)

## 🛒 도메인 구매 옵션

### 1. 추천 도메인 이름

- **handoc.ai** (최우선 추천)
- **handocai.com**
- **handoc-ai.com**
- **handoc.app**
- **handocai.app**

### 2. 도메인 등록 업체

#### 🌟 추천 업체 (한국)
- **가비아 (Gabia)**: https://www.gabia.com
  - 한국 최대 도메인 등록업체
  - 한국어 지원
  - 연간 약 15,000원 (.com)

- **후이즈 (Whois)**: https://www.whois.co.kr
  - 저렴한 가격
  - 한국어 지원
  - 연간 약 12,000원 (.com)

#### 🌍 해외 업체
- **Namecheap**: https://www.namecheap.com
  - 저렴한 가격
  - 무료 WHOIS 보호
  - 연간 약 $10-15

- **Cloudflare**: https://www.cloudflare.com/products/registrar/
  - 도매가격 제공
  - 무료 DNS 관리
  - 연간 약 $8-12

- **Google Domains**: https://domains.google.com
  - Google 통합 서비스
  - 간편한 관리
  - 연간 약 $12-15

## ⚙️ Vercel에서 커스텀 도메인 설정

### 1. 도메인 추가

1. **Vercel 대시보드 접속**
   - https://vercel.com/handoc-ai-developers-projects/handoc-ai/settings/domains

2. **Add Domain 버튼 클릭**
   - 구매한 도메인 입력 (예: `handoc.ai`)
   - Add 버튼 클릭

3. **도메인 소유권 확인**
   - TXT 레코드 또는 CNAME 레코드 추가 요구
   - 도메인 등록업체에서 DNS 설정

### 2. DNS 설정

#### A 레코드 설정 (권장)
```
Type: A
Name: @
Value: 76.76.19.19
TTL: 3600
```

#### CNAME 레코드 설정 (서브도메인용)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 3. SSL 인증서

- **자동 설정**: Vercel이 Let's Encrypt SSL 인증서 자동 발급
- **설정 시간**: 도메인 연결 후 5-10분 소요
- **HTTPS 강제**: 자동으로 HTTP → HTTPS 리디렉션

## 🔧 도메인별 설정 방법

### 가비아 (Gabia)

1. **가비아 관리콘솔 로그인**
2. **My 가비아 → 도메인 관리**
3. **DNS 관리 → DNS 설정**
4. **레코드 추가**:
   ```
   호스트: @
   타입: A
   값: 76.76.19.19
   TTL: 3600
   ```

### Cloudflare

1. **Cloudflare 대시보드 로그인**
2. **DNS → Records**
3. **Add record**:
   ```
   Type: A
   Name: @
   IPv4 address: 76.76.19.19
   TTL: Auto
   Proxy status: DNS only (회색 구름)
   ```

### Namecheap

1. **Namecheap 계정 로그인**
2. **Domain List → Manage**
3. **Advanced DNS → Add New Record**:
   ```
   Type: A Record
   Host: @
   Value: 76.76.19.19
   TTL: Automatic
   ```

## 🚀 서브도메인 설정

### www 서브도메인
```
Type: CNAME
Name: www
Value: handoc.ai (또는 메인 도메인)
TTL: 3600
```

### API 서브도메인 (백엔드용)
```
Type: CNAME
Name: api
Value: handoc-ai-backend.railway.app
TTL: 3600
```

### 모바일 앱 다운로드 페이지
```
Type: CNAME
Name: app
Value: handoc.ai
TTL: 3600
```

## 📊 도메인 연결 확인

### 1. DNS 전파 확인
```bash
# 명령어로 확인
nslookup handoc.ai
dig handoc.ai

# 온라인 도구
https://www.whatsmydns.net/
https://dnschecker.org/
```

### 2. SSL 인증서 확인
```bash
# 브라우저에서 확인
https://handoc.ai

# 명령어로 확인
openssl s_client -connect handoc.ai:443
```

### 3. 리디렉션 테스트
- `http://handoc.ai` → `https://handoc.ai` 자동 리디렉션
- `www.handoc.ai` → `handoc.ai` 리디렉션 (선택사항)

## 🎨 브랜딩 업데이트

### 1. 웹사이트 업데이트
- 로고에 새 도메인 반영
- 소셜 미디어 링크 업데이트
- 연락처 정보 업데이트

### 2. 모바일 앱 업데이트
- API 엔드포인트 URL 변경
- 앱 내 웹사이트 링크 업데이트

### 3. 마케팅 자료 업데이트
- 명함, 브로셔 등 인쇄물
- 소셜 미디어 프로필
- 이메일 서명

## 📈 SEO 최적화

### 1. Google Search Console
- 새 도메인 등록
- 사이트맵 제출
- 기존 도메인에서 301 리디렉션

### 2. 소셜 미디어 메타 태그
```html
<meta property="og:url" content="https://handoc.ai" />
<meta property="og:site_name" content="HanDoc AI" />
<meta name="twitter:domain" content="handoc.ai" />
```

### 3. 구조화된 데이터
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "HanDoc AI",
  "url": "https://handoc.ai",
  "description": "문서를 이해하는 가장 빠른 방법"
}
```

## 💰 비용 예상

### 연간 도메인 비용
- **.ai 도메인**: $50-100/년
- **.com 도메인**: $10-15/년
- **.app 도메인**: $15-20/년

### 추가 서비스 (선택사항)
- **WHOIS 보호**: $5-10/년
- **프리미엄 DNS**: $5-20/년
- **이메일 호스팅**: $20-50/년

## 🔒 보안 고려사항

### 1. WHOIS 보호
- 개인정보 보호를 위해 WHOIS 보호 서비스 활성화
- 대부분의 등록업체에서 무료 또는 저렴하게 제공

### 2. 도메인 잠금
- 무단 이전 방지를 위한 도메인 잠금 설정
- 등록업체 관리 콘솔에서 설정

### 3. 2단계 인증
- 도메인 등록업체 계정에 2FA 설정
- 보안 강화를 위한 필수 조치

## 📞 지원 및 문의

### 기술 지원
- **Vercel 지원**: https://vercel.com/support
- **도메인 등록업체 지원**: 각 업체별 고객센터

### 개발팀 문의
- **이메일**: dev@handoc.ai (도메인 연결 후)
- **GitHub**: https://github.com/yhun1542/handoc-ai

---

**🎉 커스텀 도메인 설정 가이드 완료!**

이 가이드를 따라 HanDoc AI에 전문적인 커스텀 도메인을 연결하세요.

