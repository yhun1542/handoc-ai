import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Search,
  Filter,
  MoreVertical,
  BarChart3,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { documentsAPI } from '@/api/documents'
import { analysesAPI } from '@/api/analyses'
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from '@/components/LoadingSpinner'

const statusConfig = {
  uploaded: { label: '업로드됨', color: 'bg-blue-500', variant: 'secondary' },
  processing: { label: '처리 중', color: 'bg-yellow-500', variant: 'default' },
  completed: { label: '완료', color: 'bg-green-500', variant: 'success' },
  failed: { label: '실패', color: 'bg-red-500', variant: 'destructive' }
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState(null)
  const [analysisStats, setAnalysisStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [documentsData, statsData, analysisStatsData] = await Promise.all([
        documentsAPI.getDocuments({ limit: 10 }),
        documentsAPI.getDocumentStats(),
        analysesAPI.getAnalysisStats()
      ])
      
      setDocuments(documentsData.items)
      setStats(statsData)
      setAnalysisStats(analysisStatsData)
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error)
      toast({
        title: '오류',
        description: '대시보드 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast({
        title: '파일 형식 오류',
        description: 'PDF 파일만 업로드 가능합니다.',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const result = await documentsAPI.uploadDocument(file, (progress) => {
        setUploadProgress(progress)
      })

      toast({
        title: '업로드 성공',
        description: '파일이 성공적으로 업로드되었습니다. 분석이 시작됩니다.',
      })

      // 문서 목록 새로고침
      loadDashboardData()
      
      // 분석 페이지로 이동
      navigate(`/analysis/${result.document.id}`)
    } catch (error) {
      console.error('파일 업로드 실패:', error)
      toast({
        title: '업로드 실패',
        description: error.response?.data?.detail || '파일 업로드에 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      event.target.value = '' // 파일 입력 초기화
    }
  }

  const handleDeleteDocument = async (documentId) => {
    try {
      await documentsAPI.deleteDocument(documentId)
      toast({
        title: '삭제 완료',
        description: '문서가 성공적으로 삭제되었습니다.',
      })
      loadDashboardData()
    } catch (error) {
      console.error('문서 삭제 실패:', error)
      toast({
        title: '삭제 실패',
        description: '문서 삭제에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }

  const handleReprocessDocument = async (documentId) => {
    try {
      await documentsAPI.reprocessDocument(documentId)
      toast({
        title: '재처리 시작',
        description: '문서 재처리가 시작되었습니다.',
      })
      loadDashboardData()
    } catch (error) {
      console.error('문서 재처리 실패:', error)
      toast({
        title: '재처리 실패',
        description: '문서 재처리에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" className="h-64" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">
            안녕하세요, {user?.username}님! 문서 분석 현황을 확인하세요.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <Button asChild disabled={isUploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              {isUploading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중... ({uploadProgress}%)
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  새 문서 업로드
                </>
              )}
            </label>
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>파일 업로드 중...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 문서</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_documents || 0}</div>
            <p className="text-xs text-muted-foreground">
              완료: {stats?.completed_documents || 0}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">분석 완료</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisStats?.total_analyses || 0}</div>
            <p className="text-xs text-muted-foreground">
              평균 신뢰도: {analysisStats?.average_confidence_score ? 
                (analysisStats.average_confidence_score * 100).toFixed(1) + '%' : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 처리 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.average_processing_time ? 
                Math.round(stats.average_processing_time) + 's' : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              최근 분석 기준
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">저장 공간</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_file_size ? formatFileSize(stats.total_file_size) : '0 MB'}
            </div>
            <p className="text-xs text-muted-foreground">
              총 사용량
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">최근 문서</TabsTrigger>
          <TabsTrigger value="analytics">분석 통계</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="문서 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  상태: {selectedStatus === 'all' ? '전체' : statusConfig[selectedStatus]?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                  전체
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.entries(statusConfig).map(([status, config]) => (
                  <DropdownMenuItem key={status} onClick={() => setSelectedStatus(status)}>
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>문서 목록</CardTitle>
              <CardDescription>
                업로드된 문서와 분석 상태를 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">문서가 없습니다</h3>
                  <p className="text-muted-foreground mb-4">
                    첫 번째 PDF 문서를 업로드해보세요
                  </p>
                  <Button asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      문서 업로드
                    </label>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>파일명</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>크기</TableHead>
                      <TableHead>업로드 시간</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">
                              {document.original_filename}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[document.status]?.variant || 'secondary'}>
                            {statusConfig[document.status]?.label || document.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatFileSize(document.file_size)}</TableCell>
                        <TableCell>{formatDate(document.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {document.status === 'completed' && (
                                <DropdownMenuItem asChild>
                                  <Link to={`/analysis/${document.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    분석 결과 보기
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {document.status === 'failed' && (
                                <DropdownMenuItem onClick={() => handleReprocessDocument(document.id)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  재처리
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteDocument(document.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>언어별 분석</CardTitle>
                <CardDescription>분석된 문서의 언어 분포</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisStats?.language_distribution ? (
                  <div className="space-y-4">
                    {Object.entries(analysisStats.language_distribution).map(([lang, count]) => (
                      <div key={lang} className="flex items-center justify-between">
                        <span className="capitalize">{lang === 'ko' ? '한국어' : lang === 'en' ? '영어' : lang}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(count / analysisStats.total_analyses) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">데이터가 없습니다</p>
                )}
              </CardContent>
            </Card>

            {/* Model Usage */}
            <Card>
              <CardHeader>
                <CardTitle>AI 모델 사용량</CardTitle>
                <CardDescription>사용된 AI 모델별 분포</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisStats?.model_usage ? (
                  <div className="space-y-4">
                    {Object.entries(analysisStats.model_usage).map(([model, count]) => (
                      <div key={model} className="flex items-center justify-between">
                        <span>{model}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(count / analysisStats.total_analyses) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">데이터가 없습니다</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

