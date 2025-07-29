# HanDoc AI API 명세서

## 📋 개요

HanDoc AI REST API는 문서 분석, 사용자 관리, 파일 처리 등의 기능을 제공합니다.

- **Base URL**: `https://api.handoc.ai/api/v1`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **File Upload**: `multipart/form-data`

## 🔐 인증

### JWT 토큰 기반 인증

```http
Authorization: Bearer <jwt_token>
```

### 토큰 갱신

토큰은 24시간 유효하며, 만료 전 자동 갱신됩니다.

## 📚 API 엔드포인트

### 1. 인증 (Authentication)

#### 1.1 회원가입

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "confirm_password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 1.2 로그인

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "is_premium": false
  }
}
```

#### 1.3 토큰 갱신

```http
POST /auth/refresh
```

**Headers:**
```
Authorization: Bearer <current_token>
```

**Response (200):**
```json
{
  "access_token": "new_jwt_token",
  "token_type": "bearer",
  "expires_in": 86400
}
```

#### 1.4 로그아웃

```http
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

### 2. 사용자 관리 (Users)

#### 2.1 사용자 정보 조회

```http
GET /users/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "is_active": true,
  "is_premium": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 2.2 사용자 정보 수정

```http
PUT /users/me
```

**Request Body:**
```json
{
  "username": "new_username",
  "email": "new_email@example.com"
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "uuid",
    "email": "new_email@example.com",
    "username": "new_username",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. 문서 분석 (Analysis)

#### 3.1 PDF 업로드 및 분석 시작

```http
POST /analyze/pdf
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: PDF 파일 (최대 10MB)
- `language`: 분석 언어 (optional, default: "ko")
- `ai_model`: AI 모델 (optional, default: "gpt-3.5-turbo")
- `options`: 분석 옵션 (JSON string, optional)

**Request Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "language=ko" \
  -F "ai_model=gpt-4" \
  -F "options={\"include_qa\": true, \"max_keywords\": 10}" \
  https://api.handoc.ai/api/v1/analyze/pdf
```

**Response (202):**
```json
{
  "message": "Analysis started",
  "task_id": "uuid",
  "document": {
    "id": "uuid",
    "filename": "document_uuid.pdf",
    "original_filename": "document.pdf",
    "file_size": 1024000,
    "status": "processing"
  },
  "estimated_time": 30
}
```

#### 3.2 분석 상태 조회

```http
GET /analyze/{task_id}
```

**Response (200) - Processing:**
```json
{
  "task_id": "uuid",
  "status": "processing",
  "progress": 45,
  "current_step": "ai_analysis",
  "estimated_remaining": 15
}
```

**Response (200) - Completed:**
```json
{
  "task_id": "uuid",
  "status": "completed",
  "progress": 100,
  "document": {
    "id": "uuid",
    "filename": "document.pdf",
    "file_size": 1024000
  },
  "analysis": {
    "id": "uuid",
    "summary": "문서 요약 내용...",
    "keywords": [
      {"keyword": "인공지능", "frequency": 15, "importance": 0.9},
      {"keyword": "머신러닝", "frequency": 8, "importance": 0.7}
    ],
    "qa_pairs": [
      {
        "question": "이 문서의 주요 주제는 무엇인가요?",
        "answer": "이 문서는 인공지능과 머신러닝에 대해 다룹니다."
      }
    ],
    "important_sentences": [
      {
        "sentence": "인공지능은 미래 기술의 핵심입니다.",
        "importance": 0.95,
        "page": 1
      }
    ],
    "statistics": {
      "total_pages": 10,
      "total_words": 5000,
      "processing_time": 28,
      "ai_model": "gpt-4"
    }
  }
}
```

**Response (200) - Failed:**
```json
{
  "task_id": "uuid",
  "status": "failed",
  "error": {
    "code": "PDF_PROCESSING_ERROR",
    "message": "PDF 파일을 처리할 수 없습니다.",
    "details": "파일이 손상되었거나 지원되지 않는 형식입니다."
  }
}
```

#### 3.3 분석 결과 다운로드

```http
GET /analyze/{task_id}/download
```

**Query Parameters:**
- `format`: 다운로드 형식 (`markdown`, `pdf`, `txt`, `json`)
- `include_metadata`: 메타데이터 포함 여부 (boolean, default: false)

**Response (200):**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="analysis_result.md"

# 문서 분석 결과

## 요약
문서 요약 내용...

## 키워드
- 인공지능
- 머신러닝

## Q&A
...
```

#### 3.4 분석 기록 조회

```http
GET /analyze/history
```

**Query Parameters:**
- `page`: 페이지 번호 (default: 1)
- `limit`: 페이지당 항목 수 (default: 20, max: 100)
- `status`: 상태 필터 (`completed`, `processing`, `failed`)
- `date_from`: 시작 날짜 (ISO 8601)
- `date_to`: 종료 날짜 (ISO 8601)

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "document": {
        "filename": "document.pdf",
        "original_filename": "document.pdf"
      },
      "status": "completed",
      "created_at": "2024-01-01T00:00:00Z",
      "processing_time": 28
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

### 4. 파일 관리 (Files)

#### 4.1 파일 업로드

```http
POST /files/upload
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: 업로드할 파일
- `category`: 파일 카테고리 (optional)

**Response (201):**
```json
{
  "file": {
    "id": "uuid",
    "filename": "file_uuid.pdf",
    "original_filename": "document.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "upload_url": "https://storage.handoc.ai/files/uuid"
  }
}
```

#### 4.2 파일 정보 조회

```http
GET /files/{file_id}
```

**Response (200):**
```json
{
  "id": "uuid",
  "filename": "document.pdf",
  "original_filename": "document.pdf",
  "file_size": 1024000,
  "mime_type": "application/pdf",
  "created_at": "2024-01-01T00:00:00Z",
  "download_url": "https://storage.handoc.ai/files/uuid"
}
```

#### 4.3 파일 삭제

```http
DELETE /files/{file_id}
```

**Response (204):**
```
No Content
```

### 5. 내보내기 (Export)

#### 5.1 Google Drive 업로드

```http
POST /export/gdrive
```

**Request Body:**
```json
{
  "analysis_id": "uuid",
  "format": "pdf",
  "folder_name": "HanDoc AI Results"
}
```

**Response (200):**
```json
{
  "message": "Successfully uploaded to Google Drive",
  "gdrive_url": "https://drive.google.com/file/d/...",
  "file_id": "gdrive_file_id"
}
```

#### 5.2 ChatGPT 연동 텍스트 생성

```http
POST /export/chatgpt
```

**Request Body:**
```json
{
  "analysis_id": "uuid",
  "template": "detailed" // "simple", "detailed", "qa_only"
}
```

**Response (200):**
```json
{
  "chatgpt_prompt": "다음 문서를 분석해주세요:\n\n[문서 내용]\n\n요약:\n[요약 내용]\n\n키워드:\n[키워드 목록]",
  "copy_url": "https://chat.openai.com/?q=..."
}
```

### 6. 피드백 (Feedback)

#### 6.1 피드백 제출

```http
POST /feedback
```

**Request Body:**
```json
{
  "analysis_id": "uuid",
  "rating": 5,
  "comment": "분석 결과가 매우 정확했습니다.",
  "feedback_type": "quality"
}
```

**Response (201):**
```json
{
  "message": "Feedback submitted successfully",
  "feedback_id": "uuid"
}
```

## 📊 응답 코드

### 성공 응답
- `200 OK`: 요청 성공
- `201 Created`: 리소스 생성 성공
- `202 Accepted`: 비동기 작업 시작
- `204 No Content`: 성공, 응답 본문 없음

### 클라이언트 오류
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `413 Payload Too Large`: 파일 크기 초과
- `422 Unprocessable Entity`: 유효성 검사 실패
- `429 Too Many Requests`: 요청 한도 초과

### 서버 오류
- `500 Internal Server Error`: 서버 내부 오류
- `502 Bad Gateway`: 게이트웨이 오류
- `503 Service Unavailable`: 서비스 이용 불가

## 🚨 오류 응답 형식

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details",
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "uuid"
  }
}
```

### 일반적인 오류 코드

- `INVALID_FILE_FORMAT`: 지원되지 않는 파일 형식
- `FILE_TOO_LARGE`: 파일 크기 초과
- `PDF_PROCESSING_ERROR`: PDF 처리 오류
- `AI_SERVICE_ERROR`: AI 분석 서비스 오류
- `QUOTA_EXCEEDED`: 사용량 한도 초과
- `INVALID_TOKEN`: 유효하지 않은 토큰
- `TOKEN_EXPIRED`: 토큰 만료

## 📈 Rate Limiting

### 제한 사항
- **일반 사용자**: 시간당 100회 요청
- **프리미엄 사용자**: 시간당 500회 요청
- **파일 업로드**: 일일 50개 파일 (일반), 200개 파일 (프리미엄)

### 헤더 정보
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔧 SDK 및 예제

### JavaScript/TypeScript

```typescript
import { HanDocAPI } from '@handoc/api-client';

const client = new HanDocAPI({
  baseURL: 'https://api.handoc.ai/api/v1',
  apiKey: 'your-api-key'
});

// PDF 분석
const result = await client.analyze.uploadPDF(file, {
  language: 'ko',
  aiModel: 'gpt-4'
});

// 결과 조회
const analysis = await client.analyze.getResult(result.taskId);
```

### Python

```python
from handoc_api import HanDocClient

client = HanDocClient(
    base_url='https://api.handoc.ai/api/v1',
    api_key='your-api-key'
)

# PDF 분석
result = client.analyze.upload_pdf(
    file_path='document.pdf',
    language='ko',
    ai_model='gpt-4'
)

# 결과 조회
analysis = client.analyze.get_result(result.task_id)
```

## 📝 변경 로그

### v1.0.0 (2024-01-01)
- 초기 API 릴리스
- PDF 업로드 및 분석 기능
- 사용자 인증 및 관리
- 기본 내보내기 기능

이 API 명세서는 지속적으로 업데이트되며, 변경사항은 버전 관리를 통해 추적됩니다.

