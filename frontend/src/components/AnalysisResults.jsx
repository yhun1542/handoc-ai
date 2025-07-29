import React, { useState } from 'react';
import { 
  FileText, 
  MessageSquare, 
  Tag, 
  Star, 
  Download, 
  Share2, 
  Copy, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Brain,
  Zap
} from 'lucide-react';

const AnalysisResults = ({ analysisData, fileName }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedQA, setExpandedQA] = useState({});
  const [copySuccess, setCopySuccess] = useState('');

  // 샘플 데이터 (실제로는 props로 받음)
  const sampleData = {
    summary: {
      title: "문서 요약",
      content: [
        "이 문서는 인공지능 기술의 발전과 그 응용 분야에 대해 다루고 있습니다. 특히 자연어 처리와 컴퓨터 비전 기술의 최신 동향을 중심으로 설명하고 있습니다.",
        "머신러닝과 딥러닝 기술의 발전으로 인해 다양한 산업 분야에서 AI 기술이 활용되고 있으며, 특히 의료, 금융, 교육 분야에서의 혁신적인 변화가 주목받고 있습니다.",
        "향후 AI 기술의 발전 방향과 함께 윤리적 고려사항, 규제 정책, 그리고 사회적 영향에 대한 논의가 필요하다는 점을 강조하고 있습니다."
      ],
      processingTime: "2.3초",
      confidence: 94
    },
    qa: [
      {
        question: "이 문서의 주요 주제는 무엇인가요?",
        answer: "인공지능 기술의 발전과 다양한 산업 분야에서의 응용에 대해 다루고 있습니다."
      },
      {
        question: "AI 기술이 가장 많이 활용되는 분야는 어디인가요?",
        answer: "의료, 금융, 교육 분야에서 가장 혁신적인 변화가 일어나고 있습니다."
      },
      {
        question: "문서에서 언급하는 주요 기술은 무엇인가요?",
        answer: "자연어 처리, 컴퓨터 비전, 머신러닝, 딥러닝 기술이 주요하게 언급됩니다."
      },
      {
        question: "AI 발전에 따른 고려사항은 무엇인가요?",
        answer: "윤리적 고려사항, 규제 정책, 사회적 영향에 대한 논의가 필요합니다."
      },
      {
        question: "향후 AI 기술의 전망은 어떠한가요?",
        answer: "지속적인 발전이 예상되지만 책임감 있는 개발과 활용이 중요합니다."
      }
    ],
    keywords: [
      { word: "인공지능", importance: 95, category: "기술" },
      { word: "머신러닝", importance: 88, category: "기술" },
      { word: "딥러닝", importance: 85, category: "기술" },
      { word: "자연어처리", importance: 82, category: "기술" },
      { word: "컴퓨터비전", importance: 78, category: "기술" },
      { word: "의료", importance: 75, category: "응용분야" },
      { word: "금융", importance: 72, category: "응용분야" },
      { word: "교육", importance: 70, category: "응용분야" },
      { word: "윤리", importance: 68, category: "고려사항" },
      { word: "규제", importance: 65, category: "고려사항" },
      { word: "혁신", importance: 63, category: "효과" },
      { word: "변화", importance: 60, category: "효과" },
      { word: "발전", importance: 58, category: "트렌드" },
      { word: "기술", importance: 55, category: "일반" },
      { word: "사회", importance: 52, category: "영향" }
    ],
    sentences: [
      {
        text: "인공지능 기술의 발전으로 인해 다양한 산업 분야에서 혁신적인 변화가 일어나고 있습니다.",
        importance: 92,
        page: 1
      },
      {
        text: "특히 의료 분야에서는 진단 정확도 향상과 개인 맞춤형 치료가 가능해지고 있습니다.",
        importance: 89,
        page: 3
      },
      {
        text: "자연어 처리 기술의 발전으로 인간과 컴퓨터 간의 소통이 더욱 자연스러워지고 있습니다.",
        importance: 86,
        page: 2
      },
      {
        text: "AI 기술의 발전과 함께 윤리적 고려사항과 규제 정책에 대한 논의가 중요해지고 있습니다.",
        importance: 84,
        page: 5
      },
      {
        text: "딥러닝 알고리즘의 성능 향상으로 복잡한 패턴 인식이 가능해졌습니다.",
        importance: 81,
        page: 2
      },
      {
        text: "금융 분야에서는 AI를 활용한 리스크 관리와 투자 분석이 활발해지고 있습니다.",
        importance: 78,
        page: 4
      },
      {
        text: "교육 분야에서는 개인화된 학습 경험 제공이 AI 기술로 가능해지고 있습니다.",
        importance: 75,
        page: 4
      },
      {
        text: "컴퓨터 비전 기술의 발전으로 이미지 인식과 분석 능력이 크게 향상되었습니다.",
        importance: 72,
        page: 3
      }
    ],
    metadata: {
      fileName: fileName || "sample_document.pdf",
      fileSize: "2.4 MB",
      pages: 12,
      language: "한국어",
      analysisDate: new Date().toLocaleDateString('ko-KR'),
      processingTime: "8.7초"
    }
  };

  const data = analysisData || sampleData;

  // Q&A 확장/축소 토글
  const toggleQA = (index) => {
    setExpandedQA(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // 클립보드 복사
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // 전체 결과 복사
  const copyAllResults = () => {
    const allText = `
# ${data.metadata.fileName} 분석 결과

## 📄 요약
${data.summary.content.join('\n\n')}

## ❓ 질문과 답변
${data.qa.map((item, index) => `${index + 1}. ${item.question}\n   ${item.answer}`).join('\n\n')}

## 🔑 키워드
${data.keywords.map(k => `• ${k.word} (${k.importance}%)`).join('\n')}

## ⭐ 중요 문장
${data.sentences.map((s, index) => `${index + 1}. ${s.text} (중요도: ${s.importance}%)`).join('\n\n')}

---
분석 완료: ${data.metadata.analysisDate}
처리 시간: ${data.metadata.processingTime}
    `.trim();
    
    copyToClipboard(allText, 'all');
  };

  // 탭 메뉴
  const tabs = [
    { id: 'summary', label: '요약', icon: FileText },
    { id: 'qa', label: 'Q&A', icon: MessageSquare },
    { id: 'keywords', label: '키워드', icon: Tag },
    { id: 'sentences', label: '중요 문장', icon: Star }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              분석 결과
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {data.metadata.fileName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {data.metadata.processingTime}
              </span>
              <span className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                신뢰도 {data.summary.confidence}%
              </span>
            </div>
          </div>
          
          {/* 액션 버튼들 */}
          <div className="flex items-center gap-3">
            <button
              onClick={copyAllResults}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copySuccess === 'all' ? '복사됨!' : '전체 복사'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              다운로드
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Share2 className="w-4 h-4" />
              공유
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="p-6">
        {/* 요약 탭 */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                📄 문서 요약
              </h3>
              <button
                onClick={() => copyToClipboard(data.summary.content.join('\n\n'), 'summary')}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copySuccess === 'summary' ? '복사됨!' : '복사'}
              </button>
            </div>
            
            <div className="space-y-4">
              {data.summary.content.map((paragraph, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* 요약 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">처리 시간</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{data.summary.processingTime}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">신뢰도</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{data.summary.confidence}%</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900 dark:text-purple-100">페이지 수</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{data.metadata.pages}페이지</p>
              </div>
            </div>
          </div>
        )}

        {/* Q&A 탭 */}
        {activeTab === 'qa' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                ❓ 질문과 답변
              </h3>
              <button
                onClick={() => copyToClipboard(
                  data.qa.map((item, index) => `${index + 1}. ${item.question}\n   ${item.answer}`).join('\n\n'),
                  'qa'
                )}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copySuccess === 'qa' ? '복사됨!' : '복사'}
              </button>
            </div>

            {data.qa.map((item, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleQA(index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {index + 1}. {item.question}
                  </span>
                  {expandedQA[index] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedQA[index] && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 키워드 탭 */}
        {activeTab === 'keywords' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                🔑 핵심 키워드
              </h3>
              <button
                onClick={() => copyToClipboard(
                  data.keywords.map(k => `• ${k.word} (${k.importance}%)`).join('\n'),
                  'keywords'
                )}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copySuccess === 'keywords' ? '복사됨!' : '복사'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {keyword.word}
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {keyword.importance}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${keyword.importance}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {keyword.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 중요 문장 탭 */}
        {activeTab === 'sentences' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                ⭐ 중요 문장
              </h3>
              <button
                onClick={() => copyToClipboard(
                  data.sentences.map((s, index) => `${index + 1}. ${s.text} (중요도: ${s.importance}%)`).join('\n\n'),
                  'sentences'
                )}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copySuccess === 'sentences' ? '복사됨!' : '복사'}
              </button>
            </div>

            {data.sentences.map((sentence, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    문장 {index + 1}
                  </span>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>중요도: {sentence.importance}%</span>
                    <span>페이지: {sentence.page}</span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {sentence.text}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-3">
                  <div
                    className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${sentence.importance}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;

