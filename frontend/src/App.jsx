import React from 'react'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            HanDoc AI
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
            문서를 이해하는 가장 빠른 방법
          </p>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
                🚀 HanDoc AI가 곧 출시됩니다!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                한글 PDF 문서를 AI가 자동으로 분석하여 요약, 질문/답변 생성, 키워드 추출을 제공하는 
                혁신적인 멀티플랫폼 서비스입니다.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                    📄 PDF 분석
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    한글 PDF를 업로드하면 AI가 자동으로 텍스트를 추출하고 분석합니다.
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-3">
                    🤖 AI 요약
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    OpenAI GPT-4를 활용하여 문서의 핵심 내용을 3문단으로 요약합니다.
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-3">
                    ❓ Q&A 생성
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300">
                    문서 내용을 바탕으로 자동으로 질문과 답변을 생성합니다.
                  </p>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-3">
                    🔑 키워드 추출
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300">
                    문서의 핵심 키워드와 중요 문장을 자동으로 추출합니다.
                  </p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-3">
                    📱 멀티플랫폼
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    웹, Android, iOS에서 모두 사용할 수 있는 통합 서비스입니다.
                  </p>
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
                    💾 결과 저장
                  </h3>
                  <p className="text-indigo-700 dark:text-indigo-300">
                    분석 결과를 Markdown, PDF, Text 형태로 저장하고 공유할 수 있습니다.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  🏗️ 개발 현황
                </h3>
                <div className="space-y-2 text-left">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span className="text-gray-700 dark:text-gray-300">FastAPI 백엔드 완성</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span className="text-gray-700 dark:text-gray-300">React 웹 프론트엔드 완성</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span className="text-gray-700 dark:text-gray-300">Android/iOS 모바일 앱 완성</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span className="text-gray-700 dark:text-gray-300">CI/CD 파이프라인 구축</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-2">🚀</span>
                    <span className="text-gray-700 dark:text-gray-300">배포 및 테스트 진행 중</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                GitHub에서 전체 소스코드를 확인하실 수 있습니다.
              </p>
              <a 
                href="https://github.com/yhun1542/handoc-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                GitHub에서 보기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

