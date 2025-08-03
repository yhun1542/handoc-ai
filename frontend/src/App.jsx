import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Brain, Download, Copy, Loader2, CheckCircle, AlertCircle, Sparkles, Star, Users, Clock, Database, ArrowRight, Github, Zap, Shield, Globe, Smartphone, ChevronDown, Play, Pause } from 'lucide-react';

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

// 애니메이션 컴포넌트들
const FloatingElement = ({ children, delay = 0, className = "" }) => {
  return (
    <div 
      className={`animate-float ${className}`}
      style={{ 
        animationDelay: `${delay}s`,
        animation: `float 6s ease-in-out infinite ${delay}s`
      }}
    >
      {children}
    </div>
  );
};

const GradientText = ({ children, className = "" }) => (
  <span className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

const GlowCard = ({ children, className = "", glowColor = "blue" }) => (
  <div className={`relative group ${className}`}>
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-${glowColor}-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200`}></div>
    <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl">
      {children}
    </div>
  </div>
);

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);

  // 마우스 추적 효과
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // CSS 애니메이션 추가
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
      }
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-gradient {
        background-size: 200% 200%;
        animation: gradient-shift 3s ease infinite;
      }
      .glass-effect {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .hover-lift {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .hover-lift:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }
      .text-shadow {
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .drag-active {
        transform: scale(1.05);
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
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
      const text = await extractTextFromPDF(file);
      setExtractedText(text);
      
      if (!text.trim()) {
        throw new Error('PDF에서 텍스트를 추출할 수 없습니다. 이미지 기반 PDF일 수 있습니다.');
      }

      setCurrentStep('AI 분석 중...');
      const analysis = await analyzeTextWithAI(text, apiKey);
      setAnalysisResult(analysis);
      setCurrentStep('분석 완료!');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-gradient"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* 마우스 추적 효과 */}
      <div 
        className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none transition-all duration-300"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-20">
          <FloatingElement delay={0}>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 text-shadow">
              <GradientText>HanDoc AI</GradientText>
            </h1>
          </FloatingElement>
          
          <FloatingElement delay={0.5}>
            <p className="text-3xl md:text-4xl text-gray-300 mb-6 font-light">
              문서를 이해하는 <span className="text-blue-400 font-semibold">가장 빠른 방법</span>
            </p>
          </FloatingElement>

          <FloatingElement delay={1}>
            <div className="flex items-center justify-center gap-3 text-xl text-gray-400 mb-12">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span>AI 기반 한글 PDF 문서 분석 서비스</span>
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
          </FloatingElement>

          <FloatingElement delay={1.5}>
            <button
              onClick={() => setCurrentView('analyzer')}
              className="group relative px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover-lift"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-4">
                <Brain className="w-8 h-8" />
                지금 시작하기
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </FloatingElement>
        </div>

        {/* 통계 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {[
            { number: "10K+", label: "분석된 문서", icon: FileText, color: "blue" },
            { number: "98%", label: "정확도", icon: CheckCircle, color: "green" },
            { number: "30초", label: "평균 처리시간", icon: Clock, color: "yellow" },
            { number: "24/7", label: "서비스 운영", icon: Globe, color: "purple" }
          ].map((stat, index) => (
            <FloatingElement key={index} delay={index * 0.2}>
              <GlowCard className="text-center hover-lift" glowColor={stat.color}>
                <stat.icon className={`w-8 h-8 text-${stat.color}-500 mx-auto mb-4`} />
                <div className={`text-4xl font-bold text-${stat.color}-500 mb-2`}>{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </GlowCard>
            </FloatingElement>
          ))}
        </div>

        {/* 기능 섹션 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Upload,
              title: "간편한 업로드",
              description: "드래그앤드롭으로 PDF 파일을 쉽게 업로드하고 즉시 분석을 시작하세요.",
              color: "blue",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: Brain,
              title: "AI 요약",
              description: "OpenAI GPT-4 기반으로 문서의 핵심 내용을 3문단으로 요약해드립니다.",
              color: "purple",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: FileText,
              title: "Q&A 생성",
              description: "문서 내용을 바탕으로 자동으로 질문과 답변을 생성하여 이해도를 높입니다.",
              color: "green",
              gradient: "from-green-500 to-emerald-500"
            },
            {
              icon: Star,
              title: "키워드 추출",
              description: "문서의 핵심 키워드와 중요한 문장을 자동으로 추출하여 제공합니다.",
              color: "orange",
              gradient: "from-orange-500 to-red-500"
            },
            {
              icon: Download,
              title: "결과 저장",
              description: "분석 결과를 Markdown, PDF, Text 형식으로 저장하고 공유할 수 있습니다.",
              color: "red",
              gradient: "from-red-500 to-pink-500"
            },
            {
              icon: Globe,
              title: "다국어 지원",
              description: "한국어, 영어, 일본어, 중국어 문서를 지원하며 UI도 다국어로 제공됩니다.",
              color: "indigo",
              gradient: "from-indigo-500 to-purple-500"
            }
          ].map((feature, index) => (
            <FloatingElement key={index} delay={index * 0.1}>
              <GlowCard className="hover-lift h-full" glowColor={feature.color}>
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </GlowCard>
            </FloatingElement>
          ))}
        </div>

        {/* CTA 섹션 */}
        <FloatingElement delay={2}>
          <GlowCard className="text-center hover-lift" glowColor="blue">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-16 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-gradient"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  지금 바로 문서 분석을 시작하세요
                </h2>
                <p className="text-2xl mb-10 opacity-90 font-light">
                  무료로 PDF 문서를 업로드하고 AI의 강력한 분석 기능을 체험해보세요
                </p>
                <button
                  onClick={() => setCurrentView('analyzer')}
                  className="group px-12 py-6 bg-white text-blue-600 text-2xl font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover-lift"
                >
                  <div className="flex items-center gap-4">
                    <Upload className="w-8 h-8" />
                    무료로 시작하기
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </GlowCard>
        </FloatingElement>

        {/* 푸터 */}
        <div className="text-center text-gray-400 mt-20">
          <FloatingElement delay={2.5}>
            <p className="text-xl mb-6 font-light">
              🚀 HanDoc AI - 문서를 이해하는 가장 빠른 방법
            </p>
            <div className="flex items-center justify-center gap-8">
              <a 
                href="https://github.com/yhun1542/handoc-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-blue-400 hover:text-blue-300 transition-colors text-lg"
              >
                <Github className="w-6 h-6 group-hover:scale-110 transition-transform" />
                GitHub에서 소스코드 보기
              </a>
            </div>
          </FloatingElement>
        </div>
      </div>
    </div>
  );

  // 분석기 페이지 렌더링
  const renderAnalyzerPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 animate-gradient"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <button
            onClick={() => setCurrentView('landing')}
            className="mb-8 px-6 py-3 text-blue-400 hover:text-blue-300 flex items-center gap-2 mx-auto transition-colors text-lg group"
          >
            <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
            홈으로 돌아가기
          </button>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 text-shadow">
            <GradientText>HanDoc AI</GradientText>
          </h1>
          <p className="text-2xl text-gray-300 mb-8 font-light">
            PDF 문서 분석기
          </p>
        </div>

        {/* API 키 입력 모달 */}
        {showApiKeyInput && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlowCard className="w-full max-w-md" glowColor="blue">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                OpenAI API 키 입력
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                AI 분석을 위해 OpenAI API 키가 필요합니다. 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
              </p>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-6 text-lg"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="flex-1 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-lg"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyInput(false);
                    if (apiKey) startAnalysis();
                  }}
                  disabled={!apiKey}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg font-semibold"
                >
                  확인
                </button>
              </div>
            </GlowCard>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          {/* 파일 업로드 영역 */}
          <GlowCard className="mb-8 hover-lift" glowColor="blue">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <Upload className="w-8 h-8" />
              PDF 파일 업로드
            </h2>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 drag-active' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative">
                <FileText className={`w-20 h-20 mx-auto mb-6 transition-all duration-300 ${
                  isDragging ? 'text-blue-500 scale-110' : 'text-gray-400'
                }`} />
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  PDF 파일을 드래그하여 놓거나 클릭하여 선택하세요
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  최대 10MB까지 지원
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>

            {file && (
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-blue-800 dark:text-blue-200">
                      {file.name}
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200 dark:border-red-700 flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <span className="text-red-800 dark:text-red-200 text-lg">{error}</span>
              </div>
            )}

            <button
              onClick={startAnalysis}
              disabled={!file || isProcessing}
              className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-blue-500/25 hover-lift"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{currentStep}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Brain className="w-6 h-6" />
                  AI 분석 시작
                  <Sparkles className="w-6 h-6" />
                </div>
              )}
            </button>
          </GlowCard>

          {/* 분석 결과 */}
          {analysisResult && (
            <GlowCard className="hover-lift" glowColor="green">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  분석 결과
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(analysisResult)}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 transition-all hover-lift"
                  >
                    <Copy className="w-5 h-5" />
                    복사
                  </button>
                  <button
                    onClick={downloadResult}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 transition-all hover-lift"
                  >
                    <Download className="w-5 h-5" />
                    다운로드
                  </button>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                  <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                    {analysisResult}
                  </pre>
                </div>
              </div>
            </GlowCard>
          )}

          {/* 추출된 텍스트 */}
          {extractedText && (
            <GlowCard className="mt-8 hover-lift" glowColor="purple">
              <details className="group">
                <summary className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <FileText className="w-6 h-6" />
                  추출된 원본 텍스트
                  <ChevronDown className="w-5 h-5 ml-auto group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {extractedText}
                  </pre>
                </div>
              </details>
            </GlowCard>
          )}
        </div>
      </div>
    </div>
  );

  return currentView === 'landing' ? renderLandingPage() : renderAnalyzerPage();
}

export default App;

