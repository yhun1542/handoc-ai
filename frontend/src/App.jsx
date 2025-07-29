import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, Download, Copy, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

// PDF 텍스트 추출을 위한 PDF.js 라이브러리 (CDN에서 로드)
const loadPDFJS = () => {
  return new Promise((resolve) => {
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
    document.head.appendChild(script);
  });
};

// OpenAI API를 사용한 텍스트 분석 (클라이언트 사이드)
const analyzeTextWithAI = async (text, apiKey) => {
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

${text}

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
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

function App() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [apiKey, setApiKey] = useState('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HanDoc AI
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            문서를 이해하는 가장 빠른 방법
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Sparkles className="w-4 h-4" />
            <span>실제 작동하는 AI 문서 분석 서비스</span>
          </div>
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

          {/* 추출된 텍스트 (접을 수 있는 섹션) */}
          {extractedText && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mt-8">
              <details className="group">
                <summary className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                  <FileText className="w-5 h-5" />
                  추출된 원본 텍스트
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                    클릭하여 {extractedText ? '접기' : '펼치기'}
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

        {/* 푸터 */}
        <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p className="mb-2">
            🚀 HanDoc AI - 실제 작동하는 AI 문서 분석 서비스
          </p>
          <p className="text-sm">
            <a 
              href="https://github.com/yhun1542/handoc-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub에서 소스코드 보기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

