import api from './auth'

export const analysesAPI = {
  // 분석 결과 목록 조회
  getAnalyses: async (params = {}) => {
    const {
      page = 1,
      limit = 20,
      language,
      aiModel,
      minConfidence,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort_by: sortBy,
      sort_order: sortOrder
    })

    if (language) queryParams.append('language', language)
    if (aiModel) queryParams.append('ai_model', aiModel)
    if (minConfidence !== undefined) queryParams.append('min_confidence', minConfidence.toString())

    const response = await api.get(`/analyses?${queryParams}`)
    return response.data
  },

  // 특정 분석 결과 조회
  getAnalysis: async (analysisId) => {
    const response = await api.get(`/analyses/${analysisId}`)
    return response.data
  },

  // 문서의 분석 결과 조회
  getAnalysisByDocument: async (documentId) => {
    const response = await api.get(`/analyses/document/${documentId}`)
    return response.data
  },

  // 텍스트 직접 분석
  analyzeText: async (text, language = 'ko', options = {}) => {
    const response = await api.post('/analyses/analyze-text', {
      text,
      language,
      options
    })
    return response.data
  },

  // 문서 재분석
  reanalyzeDocument: async (documentId, options = {}) => {
    const response = await api.post(`/analyses/document/${documentId}/reanalyze`, options)
    return response.data
  },

  // 분석 요약 정보
  getAnalysisSummary: async (analysisId) => {
    const response = await api.get(`/analyses/${analysisId}/summary`)
    return response.data
  },

  // 마크다운 형식으로 분석 결과 가져오기
  getAnalysisMarkdown: async (analysisId) => {
    const response = await api.get(`/analyses/${analysisId}/markdown`)
    return response.data
  },

  // 분석 결과 삭제
  deleteAnalysis: async (analysisId) => {
    const response = await api.delete(`/analyses/${analysisId}`)
    return response.data
  },

  // 분석 통계
  getAnalysisStats: async () => {
    const response = await api.get('/analyses/stats/overview')
    return response.data
  }
}

