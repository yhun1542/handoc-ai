"""
AI 분석 서비스 (OpenAI GPT 기반)
"""

import openai
import tiktoken
from typing import List, Dict, Optional, Any
import json
import logging
import asyncio
from datetime import datetime

from app.core.config import settings

logger = logging.getLogger(__name__)

# OpenAI 클라이언트 초기화
openai.api_key = settings.OPENAI_API_KEY


class AIAnalyzer:
    """AI 기반 문서 분석 클래스"""
    
    def __init__(self):
        self.default_model = settings.OPENAI_MODEL_DEFAULT
        self.premium_model = settings.OPENAI_MODEL_PREMIUM
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.temperature = settings.OPENAI_TEMPERATURE
        
        # 토큰 계산용 인코더
        self.encoding = tiktoken.encoding_for_model(self.default_model)
    
    def count_tokens(self, text: str, model: str = None) -> int:
        """텍스트의 토큰 수 계산"""
        if not model:
            model = self.default_model
        
        try:
            encoding = tiktoken.encoding_for_model(model)
            return len(encoding.encode(text))
        except Exception:
            # 대략적인 계산 (1 토큰 ≈ 4 문자)
            return len(text) // 4
    
    def split_text_by_tokens(self, text: str, max_tokens: int = 3000) -> List[str]:
        """텍스트를 토큰 수 기준으로 분할"""
        sentences = text.split('. ')
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            test_chunk = current_chunk + sentence + ". "
            if self.count_tokens(test_chunk) > max_tokens:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
            else:
                current_chunk = test_chunk
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    async def analyze_document(
        self, 
        text: str, 
        language: str = "ko",
        model: str = None,
        is_premium: bool = False
    ) -> Dict[str, Any]:
        """
        문서 전체 분석
        
        Args:
            text: 분석할 텍스트
            language: 언어 코드
            model: 사용할 AI 모델
            is_premium: 프리미엄 사용자 여부
            
        Returns:
            분석 결과
        """
        if not model:
            model = self.premium_model if is_premium else self.default_model
        
        start_time = datetime.now()
        
        try:
            # 병렬 분석 실행
            tasks = [
                self.generate_summary(text, language, model),
                self.generate_qa_pairs(text, language, model),
                self.extract_keywords_ai(text, language, model),
                self.extract_important_sentences_ai(text, language, model)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 결과 처리
            summary = results[0] if not isinstance(results[0], Exception) else ""
            qa_pairs = results[1] if not isinstance(results[1], Exception) else []
            keywords = results[2] if not isinstance(results[2], Exception) else []
            important_sentences = results[3] if not isinstance(results[3], Exception) else []
            
            end_time = datetime.now()
            processing_time = int((end_time - start_time).total_seconds())
            
            return {
                "summary": summary,
                "qa_pairs": qa_pairs,
                "keywords": keywords,
                "important_sentences": important_sentences,
                "processing_time": processing_time,
                "ai_model": model,
                "language": language,
                "confidence_score": self._calculate_confidence_score(summary, qa_pairs, keywords)
            }
            
        except Exception as e:
            logger.error(f"AI 분석 실패: {str(e)}")
            raise Exception(f"AI 분석 중 오류가 발생했습니다: {str(e)}")
    
    async def generate_summary(
        self, 
        text: str, 
        language: str = "ko", 
        model: str = None
    ) -> str:
        """문서 요약 생성"""
        if not model:
            model = self.default_model
        
        # 텍스트가 너무 긴 경우 분할
        if self.count_tokens(text) > 3000:
            chunks = self.split_text_by_tokens(text, 3000)
            chunk_summaries = []
            
            for chunk in chunks:
                chunk_summary = await self._generate_chunk_summary(chunk, language, model)
                chunk_summaries.append(chunk_summary)
            
            # 청크 요약들을 다시 요약
            combined_summary = "\n".join(chunk_summaries)
            return await self._generate_final_summary(combined_summary, language, model)
        else:
            return await self._generate_chunk_summary(text, language, model)
    
    async def _generate_chunk_summary(self, text: str, language: str, model: str) -> str:
        """텍스트 청크 요약"""
        prompt = self._get_summary_prompt(language)
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": text}
                ],
                max_tokens=500,
                temperature=self.temperature
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"요약 생성 실패: {str(e)}")
            return ""
    
    async def _generate_final_summary(self, combined_text: str, language: str, model: str) -> str:
        """최종 요약 생성"""
        prompt = self._get_final_summary_prompt(language)
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": combined_text}
                ],
                max_tokens=800,
                temperature=self.temperature
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"최종 요약 생성 실패: {str(e)}")
            return combined_text[:1000] + "..."
    
    async def generate_qa_pairs(
        self, 
        text: str, 
        language: str = "ko", 
        model: str = None,
        num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """Q&A 쌍 생성"""
        if not model:
            model = self.default_model
        
        prompt = self._get_qa_prompt(language, num_questions)
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": text}
                ],
                max_tokens=1000,
                temperature=self.temperature
            )
            
            qa_text = response.choices[0].message.content.strip()
            return self._parse_qa_response(qa_text)
            
        except Exception as e:
            logger.error(f"Q&A 생성 실패: {str(e)}")
            return []
    
    async def extract_keywords_ai(
        self, 
        text: str, 
        language: str = "ko", 
        model: str = None,
        max_keywords: int = 15
    ) -> List[Dict[str, Any]]:
        """AI 기반 키워드 추출"""
        if not model:
            model = self.default_model
        
        prompt = self._get_keyword_prompt(language, max_keywords)
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": text}
                ],
                max_tokens=500,
                temperature=0.3  # 키워드 추출은 낮은 temperature 사용
            )
            
            keywords_text = response.choices[0].message.content.strip()
            return self._parse_keywords_response(keywords_text)
            
        except Exception as e:
            logger.error(f"키워드 추출 실패: {str(e)}")
            return []
    
    async def extract_important_sentences_ai(
        self, 
        text: str, 
        language: str = "ko", 
        model: str = None,
        max_sentences: int = 8
    ) -> List[Dict[str, Any]]:
        """AI 기반 중요 문장 추출"""
        if not model:
            model = self.default_model
        
        prompt = self._get_important_sentences_prompt(language, max_sentences)
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": text}
                ],
                max_tokens=800,
                temperature=0.3
            )
            
            sentences_text = response.choices[0].message.content.strip()
            return self._parse_sentences_response(sentences_text)
            
        except Exception as e:
            logger.error(f"중요 문장 추출 실패: {str(e)}")
            return []
    
    def _get_summary_prompt(self, language: str) -> str:
        """요약 프롬프트 생성"""
        if language == "ko":
            return """당신은 문서 요약 전문가입니다. 주어진 텍스트를 3개의 문단으로 요약해주세요.

요약 규칙:
1. 첫 번째 문단: 문서의 주요 주제와 목적
2. 두 번째 문단: 핵심 내용과 주요 논점
3. 세 번째 문단: 결론이나 중요한 시사점

각 문단은 2-3문장으로 구성하고, 명확하고 간결하게 작성해주세요."""
        else:
            return """You are a document summarization expert. Please summarize the given text in 3 paragraphs.

Summary rules:
1. First paragraph: Main topic and purpose of the document
2. Second paragraph: Key content and main arguments
3. Third paragraph: Conclusions or important implications

Each paragraph should be 2-3 sentences, written clearly and concisely."""
    
    def _get_final_summary_prompt(self, language: str) -> str:
        """최종 요약 프롬프트"""
        if language == "ko":
            return """다음은 문서의 여러 부분을 요약한 내용들입니다. 이를 종합하여 전체 문서의 핵심을 3개 문단으로 요약해주세요.

요약 규칙:
1. 중복된 내용은 제거하고 핵심만 추출
2. 논리적 흐름을 유지하며 통합
3. 전체적인 맥락과 주요 메시지 강조"""
        else:
            return """The following are summaries of different parts of a document. Please synthesize them into a comprehensive 3-paragraph summary of the entire document.

Summary rules:
1. Remove redundant content and extract only the essentials
2. Maintain logical flow while integrating
3. Emphasize overall context and key messages"""
    
    def _get_qa_prompt(self, language: str, num_questions: int) -> str:
        """Q&A 프롬프트 생성"""
        if language == "ko":
            return f"""당신은 문서 분석 전문가입니다. 주어진 텍스트를 바탕으로 {num_questions}개의 질문과 답변을 생성해주세요.

규칙:
1. 문서의 핵심 내용을 다루는 질문 생성
2. 답변은 문서 내용에 근거하여 정확하게 작성
3. 다양한 유형의 질문 포함 (사실, 분석, 해석)
4. 다음 형식으로 작성:

Q1: [질문]
A1: [답변]

Q2: [질문]
A2: [답변]

...계속"""
        else:
            return f"""You are a document analysis expert. Based on the given text, generate {num_questions} questions and answers.

Rules:
1. Create questions that cover key content of the document
2. Answers should be accurate and based on document content
3. Include various types of questions (factual, analytical, interpretive)
4. Format as follows:

Q1: [Question]
A1: [Answer]

Q2: [Question]
A2: [Answer]

...continue"""
    
    def _get_keyword_prompt(self, language: str, max_keywords: int) -> str:
        """키워드 프롬프트 생성"""
        if language == "ko":
            return f"""주어진 텍스트에서 가장 중요한 키워드 {max_keywords}개를 추출해주세요.

규칙:
1. 문서의 핵심 주제를 나타내는 단어/구문 선택
2. 중요도 순으로 정렬
3. 다음 형식으로 작성:

1. [키워드] - [중요도: 높음/중간/낮음]
2. [키워드] - [중요도: 높음/중간/낮음]
...계속"""
        else:
            return f"""Extract the {max_keywords} most important keywords from the given text.

Rules:
1. Select words/phrases that represent key topics of the document
2. Sort by importance
3. Format as follows:

1. [Keyword] - [Importance: High/Medium/Low]
2. [Keyword] - [Importance: High/Medium/Low]
...continue"""
    
    def _get_important_sentences_prompt(self, language: str, max_sentences: int) -> str:
        """중요 문장 프롬프트 생성"""
        if language == "ko":
            return f"""주어진 텍스트에서 가장 중요한 문장 {max_sentences}개를 선택해주세요.

규칙:
1. 문서의 핵심 메시지를 담은 문장 선택
2. 중요도 순으로 정렬
3. 원문 그대로 인용
4. 다음 형식으로 작성:

1. "[문장]" - [중요도: 높음/중간/낮음]
2. "[문장]" - [중요도: 높음/중간/낮음]
...계속"""
        else:
            return f"""Select the {max_sentences} most important sentences from the given text.

Rules:
1. Choose sentences that contain key messages of the document
2. Sort by importance
3. Quote exactly from the original text
4. Format as follows:

1. "[Sentence]" - [Importance: High/Medium/Low]
2. "[Sentence]" - [Importance: High/Medium/Low]
...continue"""
    
    def _parse_qa_response(self, qa_text: str) -> List[Dict[str, Any]]:
        """Q&A 응답 파싱"""
        qa_pairs = []
        lines = qa_text.split('\n')
        current_q = ""
        current_a = ""
        
        for line in lines:
            line = line.strip()
            if line.startswith(('Q', 'q')) and ':' in line:
                if current_q and current_a:
                    qa_pairs.append({
                        "question": current_q,
                        "answer": current_a,
                        "confidence": 0.8
                    })
                current_q = line.split(':', 1)[1].strip()
                current_a = ""
            elif line.startswith(('A', 'a')) and ':' in line:
                current_a = line.split(':', 1)[1].strip()
            elif current_a and line:
                current_a += " " + line
        
        # 마지막 Q&A 추가
        if current_q and current_a:
            qa_pairs.append({
                "question": current_q,
                "answer": current_a,
                "confidence": 0.8
            })
        
        return qa_pairs
    
    def _parse_keywords_response(self, keywords_text: str) -> List[Dict[str, Any]]:
        """키워드 응답 파싱"""
        keywords = []
        lines = keywords_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if line and any(char.isdigit() for char in line[:3]):
                # 번호 제거
                content = re.sub(r'^\d+\.?\s*', '', line)
                
                # 중요도 추출
                importance_map = {"높음": 0.9, "high": 0.9, "중간": 0.6, "medium": 0.6, "낮음": 0.3, "low": 0.3}
                importance = 0.5
                
                for key, value in importance_map.items():
                    if key in content.lower():
                        importance = value
                        content = content.replace(f" - [중요도: {key}]", "").replace(f" - [Importance: {key}]", "")
                        break
                
                keyword = content.split(' - ')[0].strip()
                if keyword:
                    keywords.append({
                        "keyword": keyword,
                        "frequency": 1,
                        "importance": importance
                    })
        
        return keywords
    
    def _parse_sentences_response(self, sentences_text: str) -> List[Dict[str, Any]]:
        """중요 문장 응답 파싱"""
        sentences = []
        lines = sentences_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if line and any(char.isdigit() for char in line[:3]):
                # 번호 제거
                content = re.sub(r'^\d+\.?\s*', '', line)
                
                # 중요도 추출
                importance_map = {"높음": 0.9, "high": 0.9, "중간": 0.6, "medium": 0.6, "낮음": 0.3, "low": 0.3}
                importance = 0.5
                
                for key, value in importance_map.items():
                    if key in content.lower():
                        importance = value
                        break
                
                # 문장 추출 (따옴표 제거)
                sentence = content.split(' - ')[0].strip().strip('"').strip("'")
                if sentence:
                    sentences.append({
                        "sentence": sentence,
                        "importance": importance,
                        "page": 1
                    })
        
        return sentences
    
    def _calculate_confidence_score(self, summary: str, qa_pairs: List, keywords: List) -> float:
        """신뢰도 점수 계산"""
        score = 0.0
        
        # 요약 품질 (길이 기반)
        if summary and len(summary) > 100:
            score += 0.3
        
        # Q&A 품질
        if qa_pairs and len(qa_pairs) >= 3:
            score += 0.4
        
        # 키워드 품질
        if keywords and len(keywords) >= 5:
            score += 0.3
        
        return min(score, 1.0)

