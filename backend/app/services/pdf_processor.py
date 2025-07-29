"""
PDF 처리 서비스
"""

import os
import hashlib
import fitz  # PyMuPDF
import pdfplumber
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class PDFProcessor:
    """PDF 문서 처리 클래스"""
    
    def __init__(self):
        self.supported_formats = [".pdf"]
    
    def extract_text(self, file_path: str, method: str = "pymupdf") -> Dict[str, any]:
        """
        PDF에서 텍스트 추출
        
        Args:
            file_path: PDF 파일 경로
            method: 추출 방법 ("pymupdf" 또는 "pdfplumber")
            
        Returns:
            추출된 텍스트 및 메타데이터
        """
        try:
            if method == "pdfplumber":
                return self._extract_with_pdfplumber(file_path)
            else:
                return self._extract_with_pymupdf(file_path)
        except Exception as e:
            logger.error(f"PDF 텍스트 추출 실패: {str(e)}")
            raise Exception(f"PDF 처리 중 오류가 발생했습니다: {str(e)}")
    
    def _extract_with_pymupdf(self, file_path: str) -> Dict[str, any]:
        """PyMuPDF를 사용한 텍스트 추출"""
        doc = fitz.open(file_path)
        
        text_content = []
        page_texts = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text()
            page_texts.append({
                "page": page_num + 1,
                "text": page_text,
                "word_count": len(page_text.split())
            })
            text_content.append(page_text)
        
        # 메타데이터 추출
        metadata = doc.metadata
        
        doc.close()
        
        full_text = "\n\n".join(text_content)
        
        return {
            "text": full_text,
            "pages": page_texts,
            "page_count": len(doc),
            "word_count": len(full_text.split()),
            "character_count": len(full_text),
            "metadata": {
                "title": metadata.get("title", ""),
                "author": metadata.get("author", ""),
                "subject": metadata.get("subject", ""),
                "creator": metadata.get("creator", ""),
                "producer": metadata.get("producer", ""),
                "creation_date": metadata.get("creationDate", ""),
                "modification_date": metadata.get("modDate", "")
            }
        }
    
    def _extract_with_pdfplumber(self, file_path: str) -> Dict[str, any]:
        """pdfplumber를 사용한 텍스트 추출 (표 처리에 강함)"""
        text_content = []
        page_texts = []
        tables = []
        
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                # 텍스트 추출
                page_text = page.extract_text() or ""
                page_texts.append({
                    "page": page_num + 1,
                    "text": page_text,
                    "word_count": len(page_text.split())
                })
                text_content.append(page_text)
                
                # 표 추출
                page_tables = page.extract_tables()
                if page_tables:
                    for table_num, table in enumerate(page_tables):
                        tables.append({
                            "page": page_num + 1,
                            "table_number": table_num + 1,
                            "data": table
                        })
        
        full_text = "\n\n".join(text_content)
        
        return {
            "text": full_text,
            "pages": page_texts,
            "page_count": len(pdf.pages),
            "word_count": len(full_text.split()),
            "character_count": len(full_text),
            "tables": tables,
            "metadata": pdf.metadata or {}
        }
    
    def get_file_info(self, file_path: str) -> Dict[str, any]:
        """
        파일 정보 추출
        
        Args:
            file_path: 파일 경로
            
        Returns:
            파일 정보
        """
        file_path = Path(file_path)
        
        # 파일 크기
        file_size = file_path.stat().st_size
        
        # 파일 해시 (SHA-256)
        file_hash = self._calculate_file_hash(str(file_path))
        
        # MIME 타입 확인
        mime_type = "application/pdf"
        
        return {
            "filename": file_path.name,
            "file_size": file_size,
            "file_hash": file_hash,
            "mime_type": mime_type,
            "extension": file_path.suffix.lower()
        }
    
    def _calculate_file_hash(self, file_path: str) -> str:
        """파일의 SHA-256 해시 계산"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def validate_pdf(self, file_path: str) -> Tuple[bool, str]:
        """
        PDF 파일 유효성 검사
        
        Args:
            file_path: PDF 파일 경로
            
        Returns:
            (유효성, 오류 메시지)
        """
        try:
            # 파일 존재 확인
            if not os.path.exists(file_path):
                return False, "파일이 존재하지 않습니다."
            
            # 파일 크기 확인
            file_size = os.path.getsize(file_path)
            if file_size == 0:
                return False, "파일이 비어있습니다."
            
            # PDF 파일 열기 시도
            doc = fitz.open(file_path)
            
            # 페이지 수 확인
            if len(doc) == 0:
                doc.close()
                return False, "PDF에 페이지가 없습니다."
            
            # 첫 페이지 텍스트 추출 시도
            first_page = doc.load_page(0)
            first_page.get_text()
            
            doc.close()
            return True, ""
            
        except Exception as e:
            return False, f"PDF 파일이 손상되었거나 지원되지 않는 형식입니다: {str(e)}"
    
    def extract_images(self, file_path: str, output_dir: str = None) -> List[Dict[str, any]]:
        """
        PDF에서 이미지 추출
        
        Args:
            file_path: PDF 파일 경로
            output_dir: 이미지 저장 디렉토리
            
        Returns:
            추출된 이미지 정보 목록
        """
        if not output_dir:
            output_dir = os.path.dirname(file_path)
        
        os.makedirs(output_dir, exist_ok=True)
        
        doc = fitz.open(file_path)
        images = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            image_list = page.get_images()
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                
                if pix.n - pix.alpha < 4:  # GRAY or RGB
                    img_filename = f"page_{page_num + 1}_img_{img_index + 1}.png"
                    img_path = os.path.join(output_dir, img_filename)
                    pix.save(img_path)
                    
                    images.append({
                        "page": page_num + 1,
                        "image_index": img_index + 1,
                        "filename": img_filename,
                        "path": img_path,
                        "width": pix.width,
                        "height": pix.height
                    })
                
                pix = None
        
        doc.close()
        return images
    
    def get_page_count(self, file_path: str) -> int:
        """PDF 페이지 수 반환"""
        try:
            doc = fitz.open(file_path)
            page_count = len(doc)
            doc.close()
            return page_count
        except Exception:
            return 0
    
    def extract_page_text(self, file_path: str, page_number: int) -> str:
        """특정 페이지의 텍스트 추출"""
        try:
            doc = fitz.open(file_path)
            if page_number < 1 or page_number > len(doc):
                doc.close()
                raise ValueError("잘못된 페이지 번호입니다.")
            
            page = doc.load_page(page_number - 1)  # 0-based index
            text = page.get_text()
            doc.close()
            return text
        except Exception as e:
            raise Exception(f"페이지 텍스트 추출 실패: {str(e)}")
    
    def split_pdf(self, file_path: str, output_dir: str, pages_per_chunk: int = 10) -> List[str]:
        """
        PDF를 여러 파일로 분할
        
        Args:
            file_path: 원본 PDF 파일 경로
            output_dir: 출력 디렉토리
            pages_per_chunk: 청크당 페이지 수
            
        Returns:
            분할된 파일 경로 목록
        """
        os.makedirs(output_dir, exist_ok=True)
        
        doc = fitz.open(file_path)
        total_pages = len(doc)
        chunk_files = []
        
        for start_page in range(0, total_pages, pages_per_chunk):
            end_page = min(start_page + pages_per_chunk - 1, total_pages - 1)
            
            # 새 문서 생성
            new_doc = fitz.open()
            new_doc.insert_pdf(doc, from_page=start_page, to_page=end_page)
            
            # 파일 저장
            chunk_filename = f"chunk_{start_page + 1}_{end_page + 1}.pdf"
            chunk_path = os.path.join(output_dir, chunk_filename)
            new_doc.save(chunk_path)
            new_doc.close()
            
            chunk_files.append(chunk_path)
        
        doc.close()
        return chunk_files

