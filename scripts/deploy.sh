#!/bin/bash

# HanDoc AI 배포 스크립트
# 사용법: ./scripts/deploy.sh [environment]
# environment: development, staging, production

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 변수 설정
ENVIRONMENT=${1:-development}
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log_info "HanDoc AI 배포 시작 - 환경: $ENVIRONMENT"
log_info "프로젝트 루트: $PROJECT_ROOT"

# 환경별 설정
case $ENVIRONMENT in
    development)
        COMPOSE_FILE="docker-compose.yml"
        API_URL="http://localhost:8000"
        WEB_URL="http://localhost:3000"
        ;;
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        API_URL="https://handoc-ai-staging.railway.app"
        WEB_URL="https://handoc-ai-staging.vercel.app"
        ;;
    production)
        COMPOSE_FILE="docker-compose.production.yml"
        API_URL="https://api.handoc.ai"
        WEB_URL="https://handoc.ai"
        ;;
    *)
        log_error "지원하지 않는 환경입니다: $ENVIRONMENT"
        log_info "사용 가능한 환경: development, staging, production"
        exit 1
        ;;
esac

# 필수 도구 확인
check_requirements() {
    log_info "필수 도구 확인 중..."
    
    local missing_tools=()
    
    if ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_tools+=("docker-compose")
    fi
    
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "다음 도구들이 설치되어 있지 않습니다: ${missing_tools[*]}"
        exit 1
    fi
    
    log_success "모든 필수 도구가 설치되어 있습니다"
}

# 환경 변수 파일 확인
check_env_files() {
    log_info "환경 변수 파일 확인 중..."
    
    local env_file=".env.$ENVIRONMENT"
    
    if [ ! -f "$PROJECT_ROOT/$env_file" ]; then
        log_warning "환경 변수 파일이 없습니다: $env_file"
        log_info ".env.example을 복사하여 $env_file을 생성하세요"
        
        if [ -f "$PROJECT_ROOT/.env.example" ]; then
            cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/$env_file"
            log_info "$env_file 파일이 생성되었습니다. 필요한 값들을 설정해주세요."
        fi
    fi
    
    log_success "환경 변수 파일 확인 완료"
}

# Git 상태 확인
check_git_status() {
    log_info "Git 상태 확인 중..."
    
    cd "$PROJECT_ROOT"
    
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "커밋되지 않은 변경사항이 있습니다"
        git status --short
        
        if [ "$ENVIRONMENT" = "production" ]; then
            log_error "프로덕션 배포 시에는 모든 변경사항이 커밋되어야 합니다"
            exit 1
        fi
    fi
    
    local current_branch=$(git branch --show-current)
    log_info "현재 브랜치: $current_branch"
    
    if [ "$ENVIRONMENT" = "production" ] && [ "$current_branch" != "main" ]; then
        log_error "프로덕션 배포는 main 브랜치에서만 가능합니다"
        exit 1
    fi
    
    log_success "Git 상태 확인 완료"
}

# 백엔드 테스트
test_backend() {
    log_info "백엔드 테스트 실행 중..."
    
    cd "$PROJECT_ROOT/backend"
    
    if [ -f "pyproject.toml" ]; then
        # Poetry 사용
        if command -v poetry &> /dev/null; then
            poetry install --no-dev
            poetry run pytest tests/ -v
        else
            log_warning "Poetry가 설치되어 있지 않습니다. pip를 사용합니다."
            pip install -r requirements.txt
            python -m pytest tests/ -v
        fi
    else
        # pip 사용
        pip install -r requirements.txt
        python -m pytest tests/ -v
    fi
    
    log_success "백엔드 테스트 완료"
}

# 프론트엔드 테스트
test_frontend() {
    log_info "프론트엔드 테스트 실행 중..."
    
    cd "$PROJECT_ROOT/frontend"
    
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install
        pnpm test
        pnpm build
    elif [ -f "yarn.lock" ]; then
        yarn install
        yarn test
        yarn build
    else
        npm install
        npm test
        npm run build
    fi
    
    log_success "프론트엔드 테스트 완료"
}

# Docker 이미지 빌드
build_images() {
    log_info "Docker 이미지 빌드 중..."
    
    cd "$PROJECT_ROOT"
    
    # 백엔드 이미지 빌드
    docker build -t handoc-ai/backend:$TIMESTAMP ./backend
    docker tag handoc-ai/backend:$TIMESTAMP handoc-ai/backend:latest
    
    log_success "Docker 이미지 빌드 완료"
}

# 서비스 배포
deploy_services() {
    log_info "서비스 배포 중..."
    
    cd "$PROJECT_ROOT"
    
    # 기존 서비스 중지
    if [ -f "$COMPOSE_FILE" ]; then
        docker-compose -f "$COMPOSE_FILE" down
    fi
    
    # 새 서비스 시작
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "서비스 배포 완료"
}

# 헬스체크
health_check() {
    log_info "헬스체크 실행 중..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "헬스체크 시도 $attempt/$max_attempts"
        
        if curl -f "$API_URL/health" > /dev/null 2>&1; then
            log_success "API 서버가 정상적으로 실행 중입니다"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "헬스체크 실패: API 서버에 연결할 수 없습니다"
            exit 1
        fi
        
        sleep 10
        ((attempt++))
    done
}

# 데이터베이스 마이그레이션
run_migrations() {
    log_info "데이터베이스 마이그레이션 실행 중..."
    
    cd "$PROJECT_ROOT"
    
    docker-compose -f "$COMPOSE_FILE" exec -T backend alembic upgrade head
    
    log_success "데이터베이스 마이그레이션 완료"
}

# 백업 생성 (프로덕션만)
create_backup() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "데이터베이스 백업 생성 중..."
        
        local backup_file="backup_${TIMESTAMP}.sql"
        
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U handoc handoc_ai > "backups/$backup_file"
        
        log_success "백업 생성 완료: backups/$backup_file"
    fi
}

# 로그 수집
collect_logs() {
    log_info "배포 로그 수집 중..."
    
    cd "$PROJECT_ROOT"
    
    mkdir -p "logs/deploy"
    
    docker-compose -f "$COMPOSE_FILE" logs > "logs/deploy/deploy_${TIMESTAMP}.log"
    
    log_success "로그 수집 완료: logs/deploy/deploy_${TIMESTAMP}.log"
}

# 알림 전송
send_notification() {
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        log_info "Slack 알림 전송 중..."
        
        local message="🚀 HanDoc AI 배포 완료\\n환경: $ENVIRONMENT\\n시간: $(date)\\nURL: $WEB_URL"
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL"
        
        log_success "Slack 알림 전송 완료"
    fi
}

# 메인 배포 프로세스
main() {
    log_info "=== HanDoc AI 배포 시작 ==="
    
    # 사전 검사
    check_requirements
    check_env_files
    check_git_status
    
    # 백업 생성 (프로덕션만)
    create_backup
    
    # 테스트 실행
    if [ "$ENVIRONMENT" != "development" ]; then
        test_backend
        test_frontend
    fi
    
    # 이미지 빌드 및 배포
    build_images
    deploy_services
    
    # 마이그레이션 실행
    run_migrations
    
    # 헬스체크
    health_check
    
    # 로그 수집
    collect_logs
    
    # 알림 전송
    send_notification
    
    log_success "=== HanDoc AI 배포 완료 ==="
    log_info "API URL: $API_URL"
    log_info "Web URL: $WEB_URL"
    
    if [ "$ENVIRONMENT" = "development" ]; then
        log_info "개발 환경에서 로그를 확인하려면: docker-compose logs -f"
    fi
}

# 스크립트 실행
main "$@"

