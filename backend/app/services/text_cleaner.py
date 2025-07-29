"""
텍스트 정제 서비스
"""

import re
import kss
from hanspell import spell_checker
from typing import List, Dict, Optional
import logging
from langdetect import detect, LangDetectError

logger = logging.getLogger(__name__)


class TextCleaner:
    """텍스트 정제 클래스"""
    
    def __init__(self):
        # 정규표현식 패턴들
        self.patterns = {
            # 불필요한 공백 및 줄바꿈
            "excessive_whitespace": re.compile(r'\s+'),
            "excessive_newlines": re.compile(r'\n{3,}'),
            
            # 페이지 번호 및 헤더/푸터
            "page_numbers": re.compile(r'^\s*\d+\s*$', re.MULTILINE),
            "header_footer": re.compile(r'^[-=]{3,}.*?[-=]{3,}$', re.MULTILINE),
            
            # 특수 문자 및 기호
            "bullet_points": re.compile(r'^[\s]*[•·▪▫◦‣⁃]\s*', re.MULTILINE),
            "dashes": re.compile(r'[-–—]{2,}'),
            
            # 이메일 및 URL
            "email": re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
            "url": re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'),
            
            # 날짜 패턴
            "date": re.compile(r'\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}'),
            
            # 숫자 패턴
            "numbers": re.compile(r'\b\d+\b'),
            
            # 괄호 안의 내용
            "parentheses": re.compile(r'\([^)]*\)'),
            "brackets": re.compile(r'\[[^\]]*\]'),
            
            # 한글 외 문자 (선택적 사용)
            "non_korean": re.compile(r'[^\uAC00-\uD7A3\s\.,!?;:\-\(\)\[\]0-9a-zA-Z]'),
        }
    
    def clean_text(self, text: str, options: Dict[str, bool] = None) -> Dict[str, any]:
        """
        텍스트 정제
        
        Args:
            text: 원본 텍스트
            options: 정제 옵션
            
        Returns:
            정제된 텍스트 및 메타데이터
        """
        if not text or not text.strip():
            return {
                "original_text": text,
                "cleaned_text": "",
                "statistics": self._get_text_statistics(""),
                "language": "unknown"
            }
        
        # 기본 옵션 설정
        default_options = {
            "remove_excessive_whitespace": True,
            "remove_page_numbers": True,
            "remove_header_footer": True,
            "normalize_bullet_points": True,
            "fix_line_breaks": True,
            "spell_check": False,  # 시간이 오래 걸리므로 기본적으로 비활성화
            "remove_special_chars": False,
            "preserve_structure": True
        }
        
        if options:
            default_options.update(options)
        
        cleaned_text = text
        
        # 언어 감지
        language = self._detect_language(text)
        
        # 1. 과도한 공백 및 줄바꿈 정리
        if default_options["remove_excessive_whitespace"]:
            cleaned_text = self._remove_excessive_whitespace(cleaned_text)
        
        # 2. 페이지 번호 제거
        if default_options["remove_page_numbers"]:
            cleaned_text = self._remove_page_numbers(cleaned_text)
        
        # 3. 헤더/푸터 제거
        if default_options["remove_header_footer"]:
            cleaned_text = self._remove_header_footer(cleaned_text)
        
        # 4. 불릿 포인트 정규화
        if default_options["normalize_bullet_points"]:
            cleaned_text = self._normalize_bullet_points(cleaned_text)
        
        # 5. 줄바꿈 수정
        if default_options["fix_line_breaks"]:
            cleaned_text = self._fix_line_breaks(cleaned_text)
        
        # 6. 맞춤법 검사 (한국어만)
        if default_options["spell_check"] and language == "ko":
            cleaned_text = self._spell_check(cleaned_text)
        
        # 7. 특수 문자 제거 (선택적)
        if default_options["remove_special_chars"]:
            cleaned_text = self._remove_special_chars(cleaned_text)
        
        # 8. 구조 보존 처리
        if default_options["preserve_structure"]:
            cleaned_text = self._preserve_structure(cleaned_text)
        
        # 최종 정리
        cleaned_text = self._final_cleanup(cleaned_text)
        
        return {
            "original_text": text,
            "cleaned_text": cleaned_text,
            "statistics": self._get_text_statistics(cleaned_text),
            "language": language,
            "cleaning_options": default_options
        }
    
    def _detect_language(self, text: str) -> str:
        """언어 감지"""
        try:
            # 샘플 텍스트로 언어 감지 (처리 속도 향상)
            sample_text = text[:1000] if len(text) > 1000 else text
            detected_lang = detect(sample_text)
            return detected_lang
        except LangDetectError:
            # 한글 문자 비율로 판단
            korean_chars = len(re.findall(r'[\uAC00-\uD7A3]', text))
            total_chars = len(re.findall(r'[^\s]', text))
            
            if total_chars > 0 and korean_chars / total_chars > 0.3:
                return "ko"
            else:
                return "en"
    
    def _remove_excessive_whitespace(self, text: str) -> str:
        """과도한 공백 제거"""
        # 연속된 공백을 하나로
        text = self.patterns["excessive_whitespace"].sub(' ', text)
        # 연속된 줄바꿈을 최대 2개로
        text = self.patterns["excessive_newlines"].sub('\n\n', text)
        return text.strip()
    
    def _remove_page_numbers(self, text: str) -> str:
        """페이지 번호 제거"""
        return self.patterns["page_numbers"].sub('', text)
    
    def _remove_header_footer(self, text: str) -> str:
        """헤더/푸터 제거"""
        return self.patterns["header_footer"].sub('', text)
    
    def _normalize_bullet_points(self, text: str) -> str:
        """불릿 포인트 정규화"""
        return self.patterns["bullet_points"].sub('• ', text)
    
    def _fix_line_breaks(self, text: str) -> str:
        """줄바꿈 수정"""
        lines = text.split('\n')
        fixed_lines = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                fixed_lines.append('')
                continue
            
            # 문장이 완전하지 않은 경우 다음 줄과 합치기
            if (line and not line.endswith(('.', '!', '?', ':', ';')) and 
                i < len(lines) - 1 and lines[i + 1].strip() and
                not lines[i + 1].strip()[0].isupper()):
                line += ' '
            
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _spell_check(self, text: str) -> str:
        """맞춤법 검사 (한국어)"""
        try:
            # 텍스트를 문장 단위로 분할
            sentences = kss.split_sentences(text)
            corrected_sentences = []
            
            for sentence in sentences:
                if len(sentence.strip()) > 0:
                    try:
                        # hanspell을 사용한 맞춤법 검사
                        result = spell_checker.check(sentence)
                        corrected_sentences.append(result.checked)
                    except Exception:
                        # 맞춤법 검사 실패 시 원본 사용
                        corrected_sentences.append(sentence)
                else:
                    corrected_sentences.append(sentence)
            
            return ' '.join(corrected_sentences)
        except Exception as e:
            logger.warning(f"맞춤법 검사 실패: {str(e)}")
            return text
    
    def _remove_special_chars(self, text: str) -> str:
        """특수 문자 제거"""
        # 기본 문장부호는 유지하고 불필요한 특수문자만 제거
        text = re.sub(r'[^\uAC00-\uD7A3\s\.,!?;:\-\(\)\[\]0-9a-zA-Z]', '', text)
        return text
    
    def _preserve_structure(self, text: str) -> str:
        """문서 구조 보존"""
        lines = text.split('\n')
        structured_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                structured_lines.append('')
                continue
            
            # 제목 형태 감지 (짧고 끝에 마침표가 없는 경우)
            if (len(line) < 100 and not line.endswith('.') and 
                not line.startswith('•') and line[0].isupper()):
                structured_lines.append(f"\n## {line}\n")
            else:
                structured_lines.append(line)
        
        return '\n'.join(structured_lines)
    
    def _final_cleanup(self, text: str) -> str:
        """최종 정리"""
        # 연속된 공백 제거
        text = re.sub(r' +', ' ', text)
        # 연속된 줄바꿈 정리
        text = re.sub(r'\n{3,}', '\n\n', text)
        # 앞뒤 공백 제거
        return text.strip()
    
    def _get_text_statistics(self, text: str) -> Dict[str, int]:
        """텍스트 통계 정보"""
        if not text:
            return {
                "character_count": 0,
                "word_count": 0,
                "sentence_count": 0,
                "paragraph_count": 0,
                "line_count": 0
            }
        
        # 문장 분할
        try:
            sentences = kss.split_sentences(text)
            sentence_count = len([s for s in sentences if s.strip()])
        except Exception:
            sentence_count = len(re.findall(r'[.!?]+', text))
        
        # 단어 수 계산
        words = text.split()
        word_count = len(words)
        
        # 문단 수 계산
        paragraphs = [p for p in text.split('\n\n') if p.strip()]
        paragraph_count = len(paragraphs)
        
        # 줄 수 계산
        lines = [l for l in text.split('\n') if l.strip()]
        line_count = len(lines)
        
        return {
            "character_count": len(text),
            "word_count": word_count,
            "sentence_count": sentence_count,
            "paragraph_count": paragraph_count,
            "line_count": line_count
        }
    
    def extract_keywords(self, text: str, max_keywords: int = 20) -> List[Dict[str, any]]:
        """키워드 추출 (간단한 빈도 기반)"""
        if not text:
            return []
        
        # 불용어 목록 (한국어)
        stopwords = {
            '이', '그', '저', '것', '수', '등', '들', '및', '또는', '그리고', '하지만', '그러나',
            '따라서', '그래서', '또한', '즉', '예를 들어', '다시 말해', '물론', '당연히',
            '있다', '없다', '이다', '아니다', '되다', '하다', '가다', '오다', '보다', '주다',
            '받다', '만들다', '생각하다', '말하다', '알다', '모르다', '좋다', '나쁘다'
        }
        
        # 단어 추출 및 정제
        words = re.findall(r'[\uAC00-\uD7A3]+', text)
        word_freq = {}
        
        for word in words:
            if len(word) >= 2 and word not in stopwords:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # 빈도순 정렬
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        
        # 키워드 목록 생성
        keywords = []
        total_words = sum(word_freq.values())
        
        for word, freq in sorted_words[:max_keywords]:
            importance = freq / total_words if total_words > 0 else 0
            keywords.append({
                "keyword": word,
                "frequency": freq,
                "importance": min(importance * 10, 1.0)  # 0-1 범위로 정규화
            })
        
        return keywords
    
    def split_into_sentences(self, text: str) -> List[str]:
        """문장 단위로 분할"""
        try:
            sentences = kss.split_sentences(text)
            return [s.strip() for s in sentences if s.strip()]
        except Exception:
            # kss 실패 시 간단한 정규표현식 사용
            sentences = re.split(r'[.!?]+', text)
            return [s.strip() for s in sentences if s.strip()]
    
    def extract_important_sentences(self, text: str, max_sentences: int = 10) -> List[Dict[str, any]]:
        """중요 문장 추출 (길이와 키워드 기반)"""
        sentences = self.split_into_sentences(text)
        if not sentences:
            return []
        
        # 키워드 추출
        keywords = self.extract_keywords(text, max_keywords=50)
        keyword_set = {kw["keyword"] for kw in keywords}
        
        # 문장별 중요도 계산
        sentence_scores = []
        
        for i, sentence in enumerate(sentences):
            # 길이 점수 (너무 짧거나 긴 문장은 낮은 점수)
            length_score = min(len(sentence) / 100, 1.0) if len(sentence) > 20 else 0.3
            
            # 키워드 포함 점수
            sentence_words = set(re.findall(r'[\uAC00-\uD7A3]+', sentence))
            keyword_matches = len(sentence_words & keyword_set)
            keyword_score = min(keyword_matches / 5, 1.0)
            
            # 위치 점수 (문서 앞부분과 뒷부분에 가중치)
            position_score = 1.0
            if i < len(sentences) * 0.2:  # 앞 20%
                position_score = 1.2
            elif i > len(sentences) * 0.8:  # 뒤 20%
                position_score = 1.1
            
            # 최종 점수
            final_score = (length_score * 0.3 + keyword_score * 0.5 + position_score * 0.2)
            
            sentence_scores.append({
                "sentence": sentence,
                "importance": final_score,
                "page": 1  # PDF 페이지 정보가 있다면 추가
            })
        
        # 중요도순 정렬
        sentence_scores.sort(key=lambda x: x["importance"], reverse=True)
        
        return sentence_scores[:max_sentences]

