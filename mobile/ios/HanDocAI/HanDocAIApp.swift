import SwiftUI

/**
 * HanDoc AI iOS 앱의 메인 진입점
 * 
 * SwiftUI 앱 생명주기를 관리하고 초기 설정을 담당합니다.
 */
@main
struct HanDocAIApp: App {
    
    // 앱 상태 관리
    @StateObject private var authManager = AuthManager()
    @StateObject private var documentManager = DocumentManager()
    @StateObject private var themeManager = ThemeManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(documentManager)
                .environmentObject(themeManager)
                .preferredColorScheme(themeManager.colorScheme)
                .onAppear {
                    setupApp()
                }
        }
    }
    
    /**
     * 앱 초기 설정
     */
    private func setupApp() {
        // 네트워크 설정
        NetworkManager.shared.configure()
        
        // 사용자 인증 상태 복원
        authManager.restoreAuthState()
        
        // 테마 설정 복원
        themeManager.restoreThemeSettings()
        
        // 앱 버전 체크
        checkAppVersion()
    }
    
    /**
     * 앱 버전 체크 및 업데이트 알림
     */
    private func checkAppVersion() {
        // App Store 버전 체크 로직
        // 필요시 업데이트 알림 표시
    }
}

/**
 * 앱 설정 상수
 */
struct AppConfig {
    static let appName = "HanDoc AI"
    static let version = "1.0.0"
    static let buildNumber = "1"
    
    // API 설정
    #if DEBUG
    static let apiBaseURL = "http://localhost:8000"
    #else
    static let apiBaseURL = "https://api.handoc.ai"
    #endif
    
    static let apiVersion = "v1"
    
    // 앱 설정
    static let maxFileSize = 10 * 1024 * 1024 // 10MB
    static let supportedFileTypes = ["pdf"]
    static let maxMonthlyUploads = 50
}

