#!/usr/bin/env python3
"""
HanDoc AI 통합 테스트 스크립트

전체 시스템의 주요 기능을 테스트합니다:
1. API 서버 연결 테스트
2. 사용자 인증 테스트
3. 문서 업로드 테스트
4. AI 분석 테스트
5. 결과 내보내기 테스트
"""

import asyncio
import aiohttp
import json
import time
import os
from pathlib import Path
from typing import Dict, Any, Optional

# 테스트 설정
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
TEST_EMAIL = "test@handoc.ai"
TEST_PASSWORD = "TestPassword123!"
TEST_PDF_PATH = "tests/sample.pdf"

class HanDocIntegrationTest:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.access_token: Optional[str] = None
        self.user_id: Optional[str] = None
        self.document_id: Optional[str] = None
        self.analysis_id: Optional[str] = None
        
        # 테스트 결과 저장
        self.test_results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "test_details": []
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test_result(self, test_name: str, success: bool, message: str = "", duration: float = 0):
        """테스트 결과 로깅"""
        self.test_results["total_tests"] += 1
        if success:
            self.test_results["passed_tests"] += 1
            status = "✅ PASS"
        else:
            self.test_results["failed_tests"] += 1
            status = "❌ FAIL"
        
        result = {
            "test_name": test_name,
            "status": status,
            "message": message,
            "duration": f"{duration:.2f}s"
        }
        
        self.test_results["test_details"].append(result)
        print(f"{status} {test_name} ({duration:.2f}s)")
        if message:
            print(f"    {message}")
    
    async def test_api_health(self) -> bool:
        """API 서버 헬스체크 테스트"""
        start_time = time.time()
        try:
            async with self.session.get(f"{API_BASE_URL}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test_result(
                        "API Health Check", 
                        True, 
                        f"Server status: {data.get('status', 'unknown')}", 
                        time.time() - start_time
                    )
                    return True
                else:
                    self.log_test_result(
                        "API Health Check", 
                        False, 
                        f"HTTP {response.status}", 
                        time.time() - start_time
                    )
                    return False
        except Exception as e:
            self.log_test_result(
                "API Health Check", 
                False, 
                f"Connection error: {str(e)}", 
                time.time() - start_time
            )
            return False
    
    async def test_user_registration(self) -> bool:
        """사용자 회원가입 테스트"""
        start_time = time.time()
        try:
            user_data = {
                "username": "testuser",
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "full_name": "Test User"
            }
            
            async with self.session.post(
                f"{API_BASE_URL}/api/v1/auth/register",
                json=user_data
            ) as response:
                if response.status in [200, 201]:
                    data = await response.json()
                    self.user_id = data.get("user", {}).get("id")
                    self.log_test_result(
                        "User Registration", 
                        True, 
                        f"User ID: {self.user_id}", 
                        time.time() - start_time
                    )
                    return True
                elif response.status == 400:
                    # 이미 존재하는 사용자일 수 있음
                    self.log_test_result(
                        "User Registration", 
                        True, 
                        "User already exists (expected)", 
                        time.time() - start_time
                    )
                    return True
                else:
                    error_data = await response.json()
                    self.log_test_result(
                        "User Registration", 
                        False, 
                        f"HTTP {response.status}: {error_data.get('detail', 'Unknown error')}", 
                        time.time() - start_time
                    )
                    return False
        except Exception as e:
            self.log_test_result(
                "User Registration", 
                False, 
                f"Error: {str(e)}", 
                time.time() - start_time
            )
            return False
    
    async def test_user_login(self) -> bool:
        """사용자 로그인 테스트"""
        start_time = time.time()
        try:
            login_data = {
                "username": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
            
            async with self.session.post(
                f"{API_BASE_URL}/api/v1/auth/login",
                data=login_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.access_token = data.get("access_token")
                    self.log_test_result(
                        "User Login", 
                        True, 
                        f"Token received: {self.access_token[:20]}...", 
                        time.time() - start_time
                    )
                    return True
                else:
                    error_data = await response.json()
                    self.log_test_result(
                        "User Login", 
                        False, 
                        f"HTTP {response.status}: {error_data.get('detail', 'Unknown error')}", 
                        time.time() - start_time
                    )
                    return False
        except Exception as e:
            self.log_test_result(
                "User Login", 
                False, 
                f"Error: {str(e)}", 
                time.time() - start_time
            )
            return False
    
    async def test_document_upload(self) -> bool:
        """문서 업로드 테스트"""
        start_time = time.time()
        try:
            # 테스트용 PDF 파일 생성 (간단한 텍스트)
            test_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Hello HanDoc AI!) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF"
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            data = aiohttp.FormData()
            data.add_field('file', test_content, filename='test.pdf', content_type='application/pdf')
            
            async with self.session.post(
                f"{API_BASE_URL}/api/v1/documents/upload",
                data=data,
                headers=headers
            ) as response:
                if response.status in [200, 201]:
                    data = await response.json()
                    self.document_id = data.get("document", {}).get("id")
                    self.log_test_result(
                        "Document Upload", 
                        True, 
                        f"Document ID: {self.document_id}", 
                        time.time() - start_time
                    )
                    return True
                else:
                    error_data = await response.json()
                    self.log_test_result(
                        "Document Upload", 
                        False, 
                        f"HTTP {response.status}: {error_data.get('detail', 'Unknown error')}", 
                        time.time() - start_time
                    )
                    return False
        except Exception as e:
            self.log_test_result(
                "Document Upload", 
                False, 
                f"Error: {str(e)}", 
                time.time() - start_time
            )
            return False
    
    async def test_document_processing_status(self) -> bool:
        """문서 처리 상태 확인 테스트"""
        start_time = time.time()
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            # 최대 60초 동안 처리 완료 대기
            max_wait_time = 60
            check_interval = 5
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                async with self.session.get(
                    f"{API_BASE_URL}/api/v1/documents/{self.document_id}",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        status = data.get("status")
                        
                        if status == "completed":
                            self.log_test_result(
                                "Document Processing", 
                                True, 
                                f"Processing completed in {elapsed_time}s", 
                                time.time() - start_time
                            )
                            return True
                        elif status == "failed":
                            self.log_test_result(
                                "Document Processing", 
                                False, 
                                f"Processing failed: {data.get('error_message', 'Unknown error')}", 
                                time.time() - start_time
                            )
                            return False
                        else:
                            # 아직 처리 중
                            await asyncio.sleep(check_interval)
                            elapsed_time += check_interval
                    else:
                        error_data = await response.json()
                        self.log_test_result(
                            "Document Processing", 
                            False, 
                            f"HTTP {response.status}: {error_data.get('detail', 'Unknown error')}", 
                            time.time() - start_time
                        )
                        return False
            
            # 타임아웃
            self.log_test_result(
                "Document Processing", 
                False, 
                f"Processing timeout after {max_wait_time}s", 
                time.time() - start_time
            )
            return False
            
        except Exception as e:
            self.log_test_result(
                "Document Processing", 
                False, 
                f"Error: {str(e)}", 
                time.time() - start_time
            )
            return False
    
    async def test_analysis_retrieval(self) -> bool:
        """분석 결과 조회 테스트"""
        start_time = time.time()
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            async with self.session.get(
                f"{API_BASE_URL}/api/v1/analyses/document/{self.document_id}",
                headers=headers
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.analysis_id = data.get("id")
                    
                    # 분석 결과 검증
                    has_summary = bool(data.get("summary"))
                    has_keywords = bool(data.get("keywords"))
                    has_qa_pairs = bool(data.get("qa_pairs"))
                    
                    self.log_test_result(
                        "Analysis Retrieval", 
                        True, 
                        f"Summary: {has_summary}, Keywords: {has_keywords}, Q&A: {has_qa_pairs}", 
                        time.time() - start_time
                    )
                    return True
                else:
                    error_data = await response.json()
                    self.log_test_result(
                        "Analysis Retrieval", 
                        False, 
                        f"HTTP {response.status}: {error_data.get('detail', 'Unknown error')}", 
                        time.time() - start_time
                    )
                    return False
        except Exception as e:
            self.log_test_result(
                "Analysis Retrieval", 
                False, 
                f"Error: {str(e)}", 
                time.time() - start_time
            )
            return False
    
    async def test_markdown_export(self) -> bool:
        """마크다운 내보내기 테스트"""
        start_time = time.time()
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            async with self.session.get(
                f"{API_BASE_URL}/api/v1/analyses/{self.analysis_id}/markdown",
                headers=headers
            ) as response:
                if response.status == 200:
                    markdown_content = await response.text()
                    self.log_test_result(
                        "Markdown Export", 
                        True, 
                        f"Exported {len(markdown_content)} characters", 
                        time.time() - start_time
                    )
                    return True
                else:
                    error_data = await response.json()
                    self.log_test_result(
                        "Markdown Export", 
                        False, 
                        f"HTTP {response.status}: {error_data.get('detail', 'Unknown error')}", 
                        time.time() - start_time
                    )
                    return False
        except Exception as e:
            self.log_test_result(
                "Markdown Export", 
                False, 
                f"Error: {str(e)}", 
                time.time() - start_time
            )
            return False
    
    async def run_all_tests(self):
        """모든 테스트 실행"""
        print("🚀 HanDoc AI 통합 테스트 시작")
        print("=" * 50)
        
        # 테스트 순서대로 실행
        tests = [
            self.test_api_health,
            self.test_user_registration,
            self.test_user_login,
            self.test_document_upload,
            self.test_document_processing_status,
            self.test_analysis_retrieval,
            self.test_markdown_export
        ]
        
        for test in tests:
            await test()
            await asyncio.sleep(1)  # 테스트 간 간격
        
        # 결과 요약
        print("\n" + "=" * 50)
        print("📊 테스트 결과 요약")
        print("=" * 50)
        
        total = self.test_results["total_tests"]
        passed = self.test_results["passed_tests"]
        failed = self.test_results["failed_tests"]
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"총 테스트: {total}")
        print(f"성공: {passed}")
        print(f"실패: {failed}")
        print(f"성공률: {success_rate:.1f}%")
        
        if failed == 0:
            print("\n🎉 모든 테스트가 성공했습니다!")
        else:
            print(f"\n⚠️  {failed}개의 테스트가 실패했습니다.")
        
        # 상세 결과 저장
        with open("test_results.json", "w", encoding="utf-8") as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 상세 결과가 test_results.json에 저장되었습니다.")

async def main():
    """메인 함수"""
    async with HanDocIntegrationTest() as test:
        await test.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())

