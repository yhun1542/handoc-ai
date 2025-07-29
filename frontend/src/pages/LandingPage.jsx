import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Brain, 
  Zap, 
  Shield, 
  Globe, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Clock,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: FileText,
    title: 'PDF 업로드',
    description: '드래그앤드롭으로 간편하게 PDF 문서를 업로드하세요'
  },
  {
    icon: Brain,
    title: 'AI 분석',
    description: 'GPT-4 기반으로 문서를 자동 요약하고 핵심 내용을 추출합니다'
  },
  {
    icon: Zap,
    title: '빠른 처리',
    description: '평균 60초 내에 완전한 분석 결과를 제공합니다'
  },
  {
    icon: Shield,
    title: '보안',
    description: '업로드된 문서는 암호화되어 안전하게 보관됩니다'
  },
  {
    icon: Globe,
    title: '다국어 지원',
    description: '한국어와 영어 문서 분석을 지원합니다'
  },
  {
    icon: Smartphone,
    title: '모바일 최적화',
    description: '웹, Android, iOS 모든 플랫폼에서 사용 가능합니다'
  }
]

const benefits = [
  '3문단 구조화된 요약',
  '자동 Q&A 생성',
  '키워드 추출',
  '중요 문장 하이라이트',
  'Markdown/PDF 내보내기',
  'Google Drive 연동'
]

const stats = [
  { number: '10,000+', label: '분석된 문서' },
  { number: '5,000+', label: '활성 사용자' },
  { number: '99.9%', label: '정확도' },
  { number: '60초', label: '평균 처리 시간' }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  🚀 문서를 이해하는 가장 빠른 방법
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="text-primary">HanDoc AI</span>
                  <br />
                  문서 분석의 혁신
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  한글 PDF 문서를 업로드하면 AI가 자동으로 요약, 질문/답변 생성, 
                  키워드 추출까지 한 번에 처리합니다.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link to="/register">
                    무료로 시작하기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                  <Link to="/login">로그인</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>무료 체험</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>신용카드 불필요</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>즉시 사용 가능</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 backdrop-blur-sm border">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">문서 업로드</h3>
                      <p className="text-sm text-muted-foreground">PDF 파일을 드래그하세요</p>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  
                  <div className="flex items-center space-x-3">
                    <Brain className="h-8 w-8 text-primary animate-pulse" />
                    <div>
                      <h3 className="font-semibold">AI 분석 중...</h3>
                      <p className="text-sm text-muted-foreground">GPT-4가 문서를 분석합니다</p>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold">분석 완료</h3>
                      <p className="text-sm text-muted-foreground">요약, Q&A, 키워드 준비됨</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              강력한 기능들
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              HanDoc AI가 제공하는 혁신적인 문서 분석 기능들을 확인해보세요
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl lg:text-4xl font-bold">
                왜 HanDoc AI를 선택해야 할까요?
              </h2>
              <p className="text-xl text-muted-foreground">
                복잡한 문서도 몇 초 만에 핵심 내용을 파악할 수 있습니다. 
                시간을 절약하고 효율성을 높이세요.
              </p>
              
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">분석 결과 예시</h3>
                    <Badge variant="secondary">AI 생성</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">📋 요약</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        이 문서는 인공지능 기술의 발전과 그 영향에 대해 다룹니다...
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">❓ 자동 생성 질문</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        Q: 인공지능의 주요 장점은 무엇인가요?
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">🔑 키워드</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">인공지능</Badge>
                        <Badge variant="outline">머신러닝</Badge>
                        <Badge variant="outline">자동화</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              지금 바로 시작해보세요
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              무료로 HanDoc AI를 체험하고 문서 분석의 새로운 경험을 느껴보세요
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/register">
                  무료 체험 시작
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Download className="mr-2 h-5 w-5" />
                모바일 앱 다운로드
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-2">5.0 평점 • 1,000+ 리뷰</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">HanDoc AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                문서를 이해하는 가장 빠른 방법
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">제품</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>웹 앱</div>
                <div>모바일 앱</div>
                <div>API</div>
                <div>요금제</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">지원</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>도움말</div>
                <div>문의하기</div>
                <div>상태 페이지</div>
                <div>개발자 문서</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">회사</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>소개</div>
                <div>블로그</div>
                <div>채용</div>
                <div>개인정보처리방침</div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 HanDoc AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

