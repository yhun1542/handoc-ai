import api from './auth'

export const documentsAPI = {
  // 문서 업로드
  uploadDocument: async (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      },
    })
    return response.data
  },

  // 문서 목록 조회
  getDocuments: async (params = {}) => {
    const {
      page = 1,
      limit = 20,
      status,
      language,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort_by: sortBy,
      sort_order: sortOrder
    })

    if (status) queryParams.append('status', status)
    if (language) queryParams.append('language', language)

    const response = await api.get(`/documents?${queryParams}`)
    return response.data
  },

  // 특정 문서 조회
  getDocument: async (documentId) => {
    const response = await api.get(`/documents/${documentId}`)
    return response.data
  },

  // 문서 삭제
  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`)
    return response.data
  },

  // 처리 상태 조회
  getProcessingStatus: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/status`)
    return response.data
  },

  // 문서 재처리
  reprocessDocument: async (documentId) => {
    const response = await api.post(`/documents/${documentId}/reprocess`)
    return response.data
  },

  // 문서 통계
  getDocumentStats: async () => {
    const response = await api.get('/documents/stats/overview')
    return response.data
  }
}

