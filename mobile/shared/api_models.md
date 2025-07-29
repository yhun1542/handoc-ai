# HanDoc AI Mobile - 공유 API 모델

## 개요
Android와 iOS 앱에서 공통으로 사용하는 API 모델과 인터페이스를 정의합니다.

## 인증 모델

### User
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "full_name": "string",
  "is_premium": "boolean",
  "monthly_uploads": "number",
  "total_uploads": "number",
  "created_at": "datetime",
  "last_login_at": "datetime"
}
```

### AuthResponse
```json
{
  "access_token": "string",
  "token_type": "string",
  "expires_in": "number",
  "user": "User"
}
```

## 문서 모델

### Document
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "filename": "string",
  "original_filename": "string",
  "file_size": "number",
  "mime_type": "string",
  "status": "uploaded|processing|completed|failed",
  "language": "string",
  "page_count": "number",
  "word_count": "number",
  "processing_time": "number",
  "error_message": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### DocumentUploadResponse
```json
{
  "message": "string",
  "task_id": "uuid",
  "document": "Document",
  "estimated_time": "number"
}
```

### ProcessingStatus
```json
{
  "task_id": "uuid",
  "status": "uploaded|processing|completed|failed",
  "progress": "number",
  "current_step": "string",
  "estimated_remaining": "number",
  "error_message": "string"
}
```

## 분석 모델

### KeywordItem
```json
{
  "keyword": "string",
  "frequency": "number",
  "importance": "number"
}
```

### QAPair
```json
{
  "question": "string",
  "answer": "string",
  "confidence": "number"
}
```

### ImportantSentence
```json
{
  "sentence": "string",
  "importance": "number",
  "page": "number"
}
```

### Analysis
```json
{
  "id": "uuid",
  "document_id": "uuid",
  "raw_text": "string",
  "cleaned_text": "string",
  "summary": "string",
  "keywords": "KeywordItem[]",
  "qa_pairs": "QAPair[]",
  "important_sentences": "ImportantSentence[]",
  "ai_model": "string",
  "language": "string",
  "processing_time": "number",
  "confidence_score": "number",
  "total_pages": "number",
  "total_words": "number",
  "total_sentences": "number",
  "total_paragraphs": "number",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## API 엔드포인트

### 인증
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/register` - 회원가입
- `GET /api/v1/auth/me` - 현재 사용자 정보
- `GET /api/v1/auth/verify-token` - 토큰 검증
- `POST /api/v1/auth/logout` - 로그아웃

### 문서 관리
- `POST /api/v1/documents/upload` - 문서 업로드
- `GET /api/v1/documents` - 문서 목록 조회
- `GET /api/v1/documents/{id}` - 특정 문서 조회
- `DELETE /api/v1/documents/{id}` - 문서 삭제
- `GET /api/v1/documents/{id}/status` - 처리 상태 조회
- `POST /api/v1/documents/{id}/reprocess` - 문서 재처리

### 분석 결과
- `GET /api/v1/analyses` - 분석 결과 목록
- `GET /api/v1/analyses/{id}` - 특정 분석 결과 조회
- `GET /api/v1/analyses/document/{document_id}` - 문서의 분석 결과
- `POST /api/v1/analyses/analyze-text` - 텍스트 직접 분석
- `GET /api/v1/analyses/{id}/markdown` - 마크다운 형식 결과

## 에러 응답

### ErrorResponse
```json
{
  "detail": "string",
  "status_code": "number",
  "error_type": "string"
}
```

## 상태 코드
- `200` - 성공
- `201` - 생성됨
- `400` - 잘못된 요청
- `401` - 인증 필요
- `403` - 권한 없음
- `404` - 찾을 수 없음
- `413` - 파일 크기 초과
- `429` - 요청 제한 초과
- `500` - 서버 오류

## 파일 업로드 제한
- **최대 파일 크기**: 10MB
- **지원 형식**: PDF만
- **월 업로드 제한**: 
  - 무료: 50개
  - 프리미엄: 무제한

## 인증 헤더
```
Authorization: Bearer {access_token}
```

## 페이지네이션
```json
{
  "items": "Array",
  "total": "number",
  "page": "number",
  "limit": "number",
  "pages": "number"
}
```

