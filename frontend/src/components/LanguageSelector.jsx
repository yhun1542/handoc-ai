import React, { useState, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

const LanguageSelector = ({ currentLanguage = 'ko', onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  // 지원 언어 목록
  const languages = [
    {
      code: 'ko',
      name: '한국어',
      nativeName: '한국어',
      flag: '🇰🇷',
      description: '한국어로 분석 결과를 제공합니다'
    },
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      description: 'Provides analysis results in English'
    },
    {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      flag: '🇯🇵',
      description: '日本語で分析結果を提供します'
    },
    {
      code: 'zh',
      name: 'Chinese',
      nativeName: '中文',
      flag: '🇨🇳',
      description: '提供中文分析结果'
    }
  ];

  // 현재 선택된 언어 정보
  const currentLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  // 언어 변경 처리
  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
    setIsOpen(false);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('handoc-language', languageCode);
    
    // 부모 컴포넌트에 알림
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }

    // 페이지 새로고침 (실제 다국어 적용을 위해)
    // 실제 구현에서는 i18n 라이브러리 사용
    if (languageCode !== currentLanguage) {
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  // 컴포넌트 마운트 시 저장된 언어 설정 로드
  useEffect(() => {
    const savedLanguage = localStorage.getItem('handoc-language');
    if (savedLanguage && savedLanguage !== selectedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, [selectedLanguage]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.language-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative language-selector">
      {/* 언어 선택 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="언어 선택"
      >
        <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {currentLang.nativeName}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2">
              언어 선택 / Select Language
            </div>
            
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors
                  ${selectedLanguage === language.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <span className="text-xl">{language.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{language.nativeName}</span>
                    {language.code !== language.nativeName.toLowerCase() && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({language.name})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {language.description}
                  </div>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>

          {/* 추가 정보 */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 언어 설정은 분석 결과의 언어를 변경합니다. PDF 문서의 언어는 자동으로 감지됩니다.
            </div>
          </div>
        </div>
      )}

      {/* 언어 변경 알림 */}
      {selectedLanguage !== currentLanguage && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 z-40">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">언어가 변경되었습니다</span>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            페이지가 새로고침됩니다...
          </div>
        </div>
      )}
    </div>
  );
};

// 다국어 텍스트 관리 훅
export const useTranslation = (language = 'ko') => {
  const translations = {
    ko: {
      // 공통
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      success: '성공',
      cancel: '취소',
      confirm: '확인',
      save: '저장',
      delete: '삭제',
      edit: '편집',
      close: '닫기',
      
      // 파일 업로드
      uploadTitle: 'PDF 파일 업로드',
      uploadDescription: '분석할 PDF 파일을 선택하세요',
      uploadButton: '파일 선택',
      uploadCamera: '카메라 촬영',
      uploadDragDrop: '파일을 드래그하여 놓거나 클릭하세요',
      uploadSuccess: '업로드 완료!',
      uploadError: '업로드 실패',
      
      // 분석 결과
      analysisResults: '분석 결과',
      summary: '요약',
      qa: '질문과 답변',
      keywords: '키워드',
      sentences: '중요 문장',
      confidence: '신뢰도',
      processingTime: '처리 시간',
      
      // 버튼
      copy: '복사',
      copied: '복사됨!',
      download: '다운로드',
      share: '공유',
      analyze: '분석하기',
      reanalyze: '재분석',
      
      // 메뉴
      home: '홈',
      documents: '문서',
      analysis: '분석',
      settings: '설정',
      
      // 오류 메시지
      fileFormatError: 'PDF 파일만 업로드 가능합니다',
      fileSizeError: '파일 크기가 너무 큽니다',
      networkError: '네트워크 연결을 확인해주세요',
      analysisError: '분석 중 오류가 발생했습니다'
    },
    
    en: {
      // Common
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      
      // File Upload
      uploadTitle: 'Upload PDF File',
      uploadDescription: 'Select a PDF file to analyze',
      uploadButton: 'Select File',
      uploadCamera: 'Take Photo',
      uploadDragDrop: 'Drag and drop files or click here',
      uploadSuccess: 'Upload Complete!',
      uploadError: 'Upload Failed',
      
      // Analysis Results
      analysisResults: 'Analysis Results',
      summary: 'Summary',
      qa: 'Q&A',
      keywords: 'Keywords',
      sentences: 'Key Sentences',
      confidence: 'Confidence',
      processingTime: 'Processing Time',
      
      // Buttons
      copy: 'Copy',
      copied: 'Copied!',
      download: 'Download',
      share: 'Share',
      analyze: 'Analyze',
      reanalyze: 'Re-analyze',
      
      // Menu
      home: 'Home',
      documents: 'Documents',
      analysis: 'Analysis',
      settings: 'Settings',
      
      // Error Messages
      fileFormatError: 'Only PDF files are supported',
      fileSizeError: 'File size is too large',
      networkError: 'Please check your network connection',
      analysisError: 'An error occurred during analysis'
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['ko'][key] || key;
  };

  return { t };
};

export default LanguageSelector;

