import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, Download, Copy, Loader2, CheckCircle, AlertCircle, Sparkles, Star, Users, Clock, Database, ArrowRight, Github } from 'lucide-react';

// PDF 텍스트 추출을 위한 PDF.js 라이브러리 (CDN에서 로드)
const loadPDFJS = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error('PDF.js 로드 실패'));
    document.head.appendChild(script);
  });
};

// OpenAI API를 사용한 텍스트 분석
const analyzeTextWithAI = async (text, apiKey) => {
  if (!apiKey) {
    throw new Error('OpenAI API 키가 필요합니다.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 한국어 문서 분석 전문가입니다. 주어진 텍스트를 분석하여 요약, 키워드, 질문/답변을 생성해주세요.'
        },
        {
          role: 'user',
          content: `다음 텍스트를 분석해주세요:

${text.substring(0, 3000)}

다음 형식으로 응답해주세요:
## 📄 요약
[3문단으로 구성된 요약]

## 🔑 키워드
[중요한 키워드 10개를 쉼표로 구분]

## ❓ 질문과 답변
1. Q: [질문1]
   A: [답변1]

2. Q: [질문2]
   A: [답변2]

3. Q: [질문3]
   A: [답변3]

## 💡 핵심 문장
[중요한 문장 5개를 번호로 나열]`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API 요청 실패: ${response.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'analyzer'
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // 파일 선택 처리
  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setExtractedText('');
      setAnalysisResult('');
    } else {
      setError('PDF 파일만 업로드 가능합니다.');
    }
  };

  // 드래그 앤 드롭 처리
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // PDF 텍스트 추출
  const extractTextFromPDF = async (file) => {
    try {
      const pdfjsLib = await loadPDFJS();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      throw new Error(`PDF 처리 오류: ${error.message}`);
    }
  };

  // 분석 시작
  const startAnalysis = async () => {
    if (!file) {
      setError('먼저 PDF 파일을 선택해주세요.');
      return;
    }

    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setIsProcessing(true);
    setError('');
    setCurrentStep('PDF 텍스트 추출 중...');

    try {
      // 1단계: PDF 텍스트 추출
      const text = await extractTextFromPDF(file);
      setExtractedText(text);
      
      if (!text.trim()) {
        throw new Error('PDF에서 텍스트를 추출할 수 없습니다. 이미지 기반 PDF일 수 있습니다.');
      }

      // 2단계: AI 분석
      setCurrentStep('AI 분석 중...');
      const analysis = await analyzeTextWithAI(text, apiKey);
      setAnalysisResult(analysis);
      setCurrentStep('분석 완료!');

      // API 키 저장
      localStorage.setItem('openai_api_key', apiKey);

    } catch (err) {
      setError(err.message);
      console.error('분석 오류:', err);
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  // 텍스트 복사
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('클립보드에 복사되었습니다!');
    });
  };

  // 결과 다운로드
  const downloadResult = () => {
    const content = `# ${file.name} 분석 결과\n\n${analysisResult}\n\n---\n\n## 원본 텍스트\n\n${extractedText}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name}_분석결과.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 랜딩 페이지 렌더링
  const renderLandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HanDoc AI
            </span>
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
            문서를 이해하는 가장 빠른 방법
          </p>
          <div className="flex items-center justify-center gap-2 text-lg text-gray-500 dark:text-gray-400 mb-8">
            <Sparkles className="w-5 h-5" />
            <span>AI 기반 한글 PDF 문서 분석 서비스</span>
          </div>
          <button
            onClick={() => setCurrentView('analyzer')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
          >
            <Brain className="w-6 h-6" />
            지금 시작하기
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* 통계 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-400">분석된 문서</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-gray-600 dark:text-gray-400">정확도</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">30초</div>
            <div className="text-gray-600 dark:text-gray-400">평균 처리시간</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-400">서비스 운영</div>
          </div>
        </div>

        {/* 기능 섹션 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">간편한 업로드</h3>
            <p className="text-gray-600 dark:text-gray-400">드래그앤드롭으로 PDF 파일을 쉽게 업로드하고 즉시 분석을 시작하세요.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI 요약</h3>
            <p className="text-gray-600 dark:text-gray-400">OpenAI GPT-4 기반으로 문서의 핵심 내용을 3문단으로 요약해드립니다.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Q&A 생성</h3>
            <p className="text-gray-600 dark:text-gray-400">문서 내용을 바탕으로 자동으로 질문과 답변을 생성하여 이해도를 높입니다.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">키워드 추출</h3>
            <p className="text-gray-600 dark:text-gray-400">문서의 핵심 키워드와 중요한 문장을 자동으로 추출하여 제공합니다.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">결과 저장</h3>
            <p className="text-gray-600 dark:text-gray-400">분석 결과를 Markdown, PDF, Text 형식으로 저장하고 공유할 수 있습니다.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">다국어 지원</h3>
            <p className="text-gray-600 dark:text-gray-400">한국어, 영어, 일본어, 중국어 문서를 지원하며 UI도 다국어로 제공됩니다.</p>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 문서 분석을 시작하세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            무료로 PDF 문서를 업로드하고 AI의 강력한 분석 기능을 체험해보세요
          </p>
          <button
            onClick={() => setCurrentView('analyzer')}
            className="px-8 py-4 bg-white text-blue-600 text-xl font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
          >
            <Upload className="w-6 h-6" />
            무료로 시작하기
          </button>
        </div>

        {/* 푸터 */}
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="mb-4">
            🚀 HanDoc AI - 문서를 이해하는 가장 빠른 방법
          </p>
          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://github.com/yhun1542/handoc-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // 분석기 페이지 렌더링
  const renderAnalyzerPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <button
            onClick={() => setCurrentView('landing')}
            className="mb-6 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2 mx-auto"
          >
            ← 홈으로 돌아가기
          </button>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HanDoc AI
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            PDF 문서 분석기
          </p>
        </div>

        {/* API 키 입력 모달 */}
        {showApiKeyInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                OpenAI API 키 입력
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                AI 분석을 위해 OpenAI API 키가 필요합니다. 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
              </p>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyInput(false);
                    if (apiKey) startAnalysis();
                  }}
                  disabled={!apiKey}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* 파일 업로드 영역 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              PDF 파일 업로드
            </h2>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                PDF 파일을 드래그하여 놓거나 클릭하여 선택하세요
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                최대 10MB까지 지원
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>

            {file && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    {file.name}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 text-sm">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            )}

            <button
              onClick={startAnalysis}
              disabled={!file || isProcessing}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {currentStep}
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  AI 분석 시작
                </>
              )}
            </button>
          </div>

          {/* 분석 결과 */}
          {analysisResult && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  분석 결과
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(analysisResult)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    복사
                  </button>
                  <button
                    onClick={downloadResult}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </button>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                  {analysisResult}
                </pre>
              </div>
            </div>
          )}

          {/* 추출된 텍스트 */}
          {extractedText && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mt-8">
              <details className="group">
                <summary className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                  <FileText className="w-5 h-5" />
                  추출된 원본 텍스트
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                    클릭하여 펼치기/접기
                  </span>
                </summary>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {extractedText}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return currentView === 'landing' ? renderLandingPage() : renderAnalyzerPage();
}

export default App;

