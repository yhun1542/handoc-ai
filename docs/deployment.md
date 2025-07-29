# HanDoc AI 배포 가이드

## 📋 개요

이 문서는 HanDoc AI 프로젝트를 다양한 환경에 배포하는 방법을 설명합니다.

## 🏗️ 배포 아키텍처

```mermaid
graph TB
    subgraph "CDN"
        CF[Cloudflare]
    end
    
    subgraph "Frontend"
        VERCEL[Vercel/Netlify]
    end
    
    subgraph "Backend"
        RAILWAY[Railway/Render]
        WORKER[Background Workers]
    end
    
    subgraph "Database"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis)]
    end
    
    subgraph "Storage"
        S3[AWS S3/MinIO]
    end
    
    subgraph "External APIs"
        OPENAI[OpenAI]
        GDRIVE[Google Drive]
    end
    
    CF --> VERCEL
    VERCEL --> RAILWAY
    RAILWAY --> POSTGRES
    RAILWAY --> REDIS
    RAILWAY --> S3
    RAILWAY --> OPENAI
    RAILWAY --> GDRIVE
    WORKER --> POSTGRES
    WORKER --> REDIS
```

## 🚀 배포 옵션

### 1. 로컬 개발 환경

#### Docker Compose 사용

```bash
# 저장소 클론
git clone https://github.com/your-username/handoc-ai.git
cd handoc-ai

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 값들을 설정

# 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

#### 개별 서비스 실행

```bash
# 백엔드
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 프론트엔드
cd frontend
npm install
npm start

# 데이터베이스 (별도 터미널)
docker run -d \
  --name handoc-postgres \
  -e POSTGRES_DB=handoc_ai \
  -e POSTGRES_USER=handoc_user \
  -e POSTGRES_PASSWORD=handoc_password \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. 클라우드 배포

#### 2.1 백엔드 배포 (Railway)

**Railway 배포 단계:**

1. **Railway 계정 생성 및 프로젝트 생성**
   ```bash
   # Railway CLI 설치
   npm install -g @railway/cli
   
   # 로그인
   railway login
   
   # 프로젝트 생성
   railway init
   ```

2. **환경 변수 설정**
   ```bash
   # Railway 대시보드에서 설정하거나 CLI 사용
   railway variables set OPENAI_API_KEY=your-api-key
   railway variables set SECRET_KEY=your-secret-key
   railway variables set DATABASE_URL=postgresql://...
   ```

3. **데이터베이스 추가**
   ```bash
   # PostgreSQL 플러그인 추가
   railway add postgresql
   
   # Redis 플러그인 추가
   railway add redis
   ```

4. **배포**
   ```bash
   # 백엔드 디렉토리에서
   cd backend
   railway deploy
   ```

**Railway 설정 파일 (railway.toml):**
```toml
[build]
builder = "NIXPACKS"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
PORT = "8000"
```

#### 2.2 백엔드 배포 (Render)

**Render 배포 단계:**

1. **render.yaml 설정**
   ```yaml
   services:
     - type: web
       name: handoc-api
       env: python
       buildCommand: "pip install -r requirements.txt"
       startCommand: "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
       envVars:
         - key: OPENAI_API_KEY
           sync: false
         - key: SECRET_KEY
           generateValue: true
         - key: DATABASE_URL
           fromDatabase:
             name: handoc-db
             property: connectionString
   
   databases:
     - name: handoc-db
       databaseName: handoc_ai
       user: handoc_user
   ```

2. **GitHub 연결 및 자동 배포 설정**

#### 2.3 프론트엔드 배포 (Vercel)

**Vercel 배포 단계:**

1. **vercel.json 설정**
   ```json
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "build"
         }
       }
     ],
     "routes": [
       {
         "src": "/static/(.*)",
         "headers": {
           "cache-control": "s-maxage=31536000,immutable"
         }
       },
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ],
     "env": {
       "REACT_APP_API_URL": "@api_url"
     }
   }
   ```

2. **환경 변수 설정**
   ```bash
   # Vercel CLI 사용
   vercel env add REACT_APP_API_URL production
   # 또는 Vercel 대시보드에서 설정
   ```

3. **배포**
   ```bash
   # 프론트엔드 디렉토리에서
   cd frontend
   vercel --prod
   ```

#### 2.4 프론트엔드 배포 (Netlify)

**netlify.toml 설정:**
```toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  REACT_APP_API_URL = "https://your-api-domain.com/api/v1"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. AWS 배포

#### 3.1 ECS Fargate 배포

**docker-compose.aws.yml:**
```yaml
version: '3.8'
services:
  backend:
    image: your-account.dkr.ecr.region.amazonaws.com/handoc-backend:latest
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "8000:8000"
    
  frontend:
    image: your-account.dkr.ecr.region.amazonaws.com/handoc-frontend:latest
    ports:
      - "3000:3000"
```

**ECS 태스크 정의:**
```json
{
  "family": "handoc-ai",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "handoc-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/handoc-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://..."
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/handoc-ai",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 3.2 Lambda + API Gateway 배포

**serverless.yml:**
```yaml
service: handoc-ai-serverless

provider:
  name: aws
  runtime: python3.9
  region: us-west-2
  environment:
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}
    DATABASE_URL: ${env:DATABASE_URL}

functions:
  api:
    handler: app.main.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
    timeout: 30
    memorySize: 1024

plugins:
  - serverless-python-requirements
  - serverless-wsgi

custom:
  wsgi:
    app: app.main.app
  pythonRequirements:
    dockerizePip: true
```

### 4. Kubernetes 배포

#### 4.1 Kubernetes 매니페스트

**k8s/namespace.yaml:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: handoc-ai
```

**k8s/configmap.yaml:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: handoc-config
  namespace: handoc-ai
data:
  CORS_ORIGINS: "https://handoc.ai"
  MAX_FILE_SIZE: "10485760"
  ALLOWED_FILE_TYPES: "application/pdf"
```

**k8s/secret.yaml:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: handoc-secrets
  namespace: handoc-ai
type: Opaque
data:
  OPENAI_API_KEY: <base64-encoded-key>
  SECRET_KEY: <base64-encoded-secret>
  DATABASE_URL: <base64-encoded-url>
```

**k8s/backend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: handoc-backend
  namespace: handoc-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: handoc-backend
  template:
    metadata:
      labels:
        app: handoc-backend
    spec:
      containers:
      - name: backend
        image: handoc/backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: handoc-config
        - secretRef:
            name: handoc-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**k8s/backend-service.yaml:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: handoc-backend-service
  namespace: handoc-ai
spec:
  selector:
    app: handoc-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

**k8s/ingress.yaml:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: handoc-ingress
  namespace: handoc-ai
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.handoc.ai
    secretName: handoc-tls
  rules:
  - host: api.handoc.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: handoc-backend-service
            port:
              number: 80
```

#### 4.2 Helm 차트

**helm/Chart.yaml:**
```yaml
apiVersion: v2
name: handoc-ai
description: HanDoc AI Helm Chart
version: 0.1.0
appVersion: "1.0.0"
```

**helm/values.yaml:**
```yaml
backend:
  image:
    repository: handoc/backend
    tag: latest
    pullPolicy: IfNotPresent
  
  replicaCount: 3
  
  service:
    type: ClusterIP
    port: 80
    targetPort: 8000
  
  resources:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "500m"

frontend:
  image:
    repository: handoc/frontend
    tag: latest
    pullPolicy: IfNotPresent
  
  replicaCount: 2
  
  service:
    type: ClusterIP
    port: 80
    targetPort: 3000

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: handoc.ai
      paths:
        - path: /
          pathType: Prefix
    - host: api.handoc.ai
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: handoc-tls
      hosts:
        - handoc.ai
        - api.handoc.ai

postgresql:
  enabled: true
  auth:
    postgresPassword: "handoc_password"
    username: "handoc_user"
    password: "handoc_password"
    database: "handoc_ai"

redis:
  enabled: true
  auth:
    enabled: false
```

## 🔄 CI/CD 파이프라인

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          cd backend
          pytest
      
      - name: Run linting
        run: |
          cd backend
          flake8 app/
          black --check app/

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push backend image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest
      
      - name: Build and push frontend image
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Railway
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RAILWAY_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"environment": "production"}' \
            https://backboard.railway.app/graphql/v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## 🔧 환경별 설정

### 개발 환경
```bash
# .env.development
DEBUG=true
LOG_LEVEL=DEBUG
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://handoc_user:handoc_password@localhost:5432/handoc_ai_dev
```

### 스테이징 환경
```bash
# .env.staging
DEBUG=false
LOG_LEVEL=INFO
CORS_ORIGINS=https://staging.handoc.ai
DATABASE_URL=postgresql://user:pass@staging-db:5432/handoc_ai_staging
```

### 프로덕션 환경
```bash
# .env.production
DEBUG=false
LOG_LEVEL=WARNING
CORS_ORIGINS=https://handoc.ai
DATABASE_URL=postgresql://user:pass@prod-db:5432/handoc_ai
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 📊 모니터링 및 로깅

### 1. 로깅 설정

**backend/app/core/logging.py:**
```python
import logging
import sys
from loguru import logger

class InterceptHandler(logging.Handler):
    def emit(self, record):
        logger_opt = logger.opt(depth=6, exception=record.exc_info)
        logger_opt.log(record.levelname, record.getMessage())

def setup_logging():
    logging.basicConfig(handlers=[InterceptHandler()], level=0)
    logger.configure(
        handlers=[
            {
                "sink": sys.stdout,
                "format": "{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
                "level": "INFO"
            },
            {
                "sink": "logs/app.log",
                "format": "{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
                "rotation": "10 MB",
                "retention": "1 week",
                "level": "DEBUG"
            }
        ]
    )
```

### 2. 헬스체크 엔드포인트

**backend/app/api/v1/health.py:**
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
import redis

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # 데이터베이스 연결 확인
        db.execute("SELECT 1")
        
        # Redis 연결 확인
        r = redis.Redis.from_url(settings.REDIS_URL)
        r.ping()
        
        return {
            "status": "healthy",
            "database": "connected",
            "redis": "connected",
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }
```

## 🔒 보안 고려사항

### 1. 환경 변수 보안
- 프로덕션에서는 환경 변수를 안전하게 관리
- AWS Secrets Manager, HashiCorp Vault 등 사용
- 컨테이너 이미지에 시크릿 포함하지 않기

### 2. 네트워크 보안
- HTTPS 강제 사용
- CORS 설정 적절히 구성
- API Rate Limiting 적용

### 3. 데이터베이스 보안
- 데이터베이스 암호화
- 백업 암호화
- 접근 권한 최소화

## 📈 성능 최적화

### 1. 캐싱 전략
```python
# Redis 캐싱 예제
@cache(expire=3600)  # 1시간 캐시
async def get_analysis_result(analysis_id: str):
    return await db.get_analysis(analysis_id)
```

### 2. 데이터베이스 최적화
```sql
-- 인덱스 생성
CREATE INDEX CONCURRENTLY idx_documents_user_id ON documents(user_id);
CREATE INDEX CONCURRENTLY idx_analyses_document_id ON analyses(document_id);

-- 파티셔닝 (대용량 데이터용)
CREATE TABLE analyses_2024 PARTITION OF analyses
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 3. CDN 설정
```javascript
// Cloudflare 설정 예제
const cloudflareConfig = {
  caching: {
    browser_ttl: 86400,
    edge_ttl: 86400,
    cache_level: "aggressive"
  },
  compression: {
    gzip: true,
    brotli: true
  }
};
```

## 🔄 백업 및 복구

### 1. 데이터베이스 백업
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="handoc_backup_$DATE.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
aws s3 cp $BACKUP_FILE s3://handoc-backups/
rm $BACKUP_FILE
```

### 2. 파일 백업
```bash
#!/bin/bash
# file_backup.sh
aws s3 sync /app/uploads s3://handoc-file-backups/$(date +%Y%m%d)/
```

이 배포 가이드를 따라하면 HanDoc AI를 다양한 환경에 안전하고 효율적으로 배포할 수 있습니다.

