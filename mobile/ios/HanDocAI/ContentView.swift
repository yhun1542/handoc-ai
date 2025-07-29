import SwiftUI

/**
 * HanDoc AI iOS 앱의 메인 콘텐츠 뷰
 * 
 * 인증 상태에 따라 적절한 화면을 표시합니다.
 */
struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var themeManager: ThemeManager
    @State private var isLoading = true
    
    var body: some View {
        Group {
            if isLoading {
                SplashView()
            } else if authManager.isAuthenticated {
                MainTabView()
            } else {
                AuthenticationView()
            }
        }
        .onAppear {
            // 초기 로딩 시뮬레이션
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation(.easeInOut(duration: 0.5)) {
                    isLoading = false
                }
            }
        }
    }
}

/**
 * 스플래시 화면
 */
struct SplashView: View {
    @State private var logoScale: CGFloat = 0.8
    @State private var logoOpacity: Double = 0.0
    
    var body: some View {
        ZStack {
            // 그라데이션 배경
            LinearGradient(
                gradient: Gradient(colors: [
                    Color("PrimaryColor"),
                    Color("SecondaryColor")
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // 로고
                Image("AppLogo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 120, height: 120)
                    .scaleEffect(logoScale)
                    .opacity(logoOpacity)
                
                // 앱 이름
                Text("HanDoc AI")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .opacity(logoOpacity)
                
                // 슬로건
                Text("문서를 이해하는 가장 빠른 방법")
                    .font(.headline)
                    .foregroundColor(.white.opacity(0.9))
                    .opacity(logoOpacity)
                
                // 로딩 인디케이터
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.2)
                    .opacity(logoOpacity)
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.0)) {
                logoScale = 1.0
                logoOpacity = 1.0
            }
        }
    }
}

/**
 * 메인 탭 뷰
 */
struct MainTabView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // 홈 탭
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("홈")
                }
                .tag(0)
            
            // 문서 탭
            DocumentsView()
                .tabItem {
                    Image(systemName: "doc.fill")
                    Text("문서")
                }
                .tag(1)
            
            // 분석 탭
            AnalysisView()
                .tabItem {
                    Image(systemName: "brain.head.profile")
                    Text("분석")
                }
                .tag(2)
            
            // 설정 탭
            SettingsView()
                .tabItem {
                    Image(systemName: "gearshape.fill")
                    Text("설정")
                }
                .tag(3)
        }
        .accentColor(Color("PrimaryColor"))
    }
}

/**
 * 인증 화면
 */
struct AuthenticationView: View {
    @State private var showingLogin = true
    
    var body: some View {
        NavigationView {
            if showingLogin {
                LoginView(showingLogin: $showingLogin)
            } else {
                RegisterView(showingLogin: $showingLogin)
            }
        }
    }
}

// MARK: - Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AuthManager())
            .environmentObject(DocumentManager())
            .environmentObject(ThemeManager())
    }
}

