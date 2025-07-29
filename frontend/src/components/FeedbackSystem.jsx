import React, { useState } from 'react';
import { 
  MessageSquare, 
  Star, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Bug, 
  Lightbulb, 
  Heart,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const FeedbackSystem = ({ isOpen, onClose, analysisId }) => {
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState(null);

  // 피드백 타입 옵션
  const feedbackTypes = [
    {
      id: 'general',
      label: '일반 피드백',
      icon: MessageSquare,
      description: '서비스에 대한 전반적인 의견'
    },
    {
      id: 'bug',
      label: '버그 신고',
      icon: Bug,
      description: '오류나 문제점 신고'
    },
    {
      id: 'feature',
      label: '기능 제안',
      icon: Lightbulb,
      description: '새로운 기능이나 개선사항 제안'
    },
    {
      id: 'analysis',
      label: '분석 품질',
      icon: Star,
      description: 'AI 분석 결과에 대한 평가'
    }
  ];

  // 빠른 피드백 옵션
  const quickFeedbackOptions = [
    { id: 'excellent', label: '훌륭해요!', icon: '🎉', color: 'green' },
    { id: 'good', label: '좋아요', icon: '👍', color: 'blue' },
    { id: 'okay', label: '괜찮아요', icon: '👌', color: 'yellow' },
    { id: 'poor', label: '아쉬워요', icon: '👎', color: 'orange' },
    { id: 'bad', label: '별로예요', icon: '😞', color: 'red' }
  ];

  // 피드백 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 실제 구현에서는 API 호출
      const feedbackData = {
        type: feedbackType,
        rating,
        comment,
        email,
        analysisId,
        quickFeedback,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // 시뮬레이션된 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('피드백 제출:', feedbackData);
      
      setIsSubmitted(true);
      
      // 3초 후 자동으로 닫기
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
      
    } catch (error) {
      console.error('피드백 제출 실패:', error);
      alert('피드백 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 빠른 피드백 제출
  const handleQuickFeedback = async (feedbackId) => {
    setQuickFeedback(feedbackId);
    setIsSubmitting(true);

    try {
      // 실제 구현에서는 API 호출
      const quickFeedbackData = {
        type: 'quick',
        feedback: feedbackId,
        analysisId,
        timestamp: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('빠른 피드백 제출:', quickFeedbackData);
      
      setIsSubmitted(true);
      
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
      
    } catch (error) {
      console.error('빠른 피드백 제출 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFeedbackType('general');
    setRating(0);
    setComment('');
    setEmail('');
    setQuickFeedback(null);
    setIsSubmitted(false);
    setIsSubmitting(false);
  };

  // 별점 클릭 핸들러
  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              피드백 보내기
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 제출 완료 상태 */}
        {isSubmitted ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              피드백이 전송되었습니다!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              소중한 의견 감사합니다. 더 나은 서비스를 위해 활용하겠습니다.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Heart className="w-4 h-4 text-red-500" />
              HanDoc AI 팀 드림
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* 빠른 피드백 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                빠른 평가
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {quickFeedbackOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleQuickFeedback(option.id)}
                    disabled={isSubmitting}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-center
                      ${quickFeedback === option.id
                        ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                    `}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 구분선 */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">또는 상세한 피드백</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* 상세 피드백 폼 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 피드백 타입 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  피드백 유형
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFeedbackType(type.id)}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all
                          ${feedbackType === type.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`w-5 h-5 ${feedbackType === type.id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {type.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {type.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 별점 평가 (분석 품질 피드백일 때만) */}
              {feedbackType === 'analysis' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    분석 품질 평가
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        className="p-1 transition-colors"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                        {rating}점 / 5점
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 상세 의견 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  상세 의견
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="자세한 의견을 남겨주세요..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>

              {/* 이메일 (선택사항) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  이메일 (선택사항)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="답변을 받고 싶으시면 이메일을 입력해주세요"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  이메일은 답변 목적으로만 사용되며, 다른 용도로 사용되지 않습니다.
                </p>
              </div>

              {/* 제출 버튼 */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!comment.trim() && feedbackType !== 'quick')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      피드백 전송
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// 피드백 버튼 컴포넌트
export const FeedbackButton = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
        rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
        ${className}
      `}
    >
      <MessageSquare className="w-4 h-4" />
      피드백
    </button>
  );
};

export default FeedbackSystem;

