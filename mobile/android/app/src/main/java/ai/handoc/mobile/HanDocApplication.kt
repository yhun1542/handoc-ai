package ai.handoc.mobile

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

/**
 * HanDoc AI Android Application
 * 
 * Hilt를 사용한 의존성 주입 설정
 */
@HiltAndroidApp
class HanDocApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // 애플리케이션 초기화 로직
        initializeApp()
    }
    
    private fun initializeApp() {
        // 로깅 설정
        if (BuildConfig.DEBUG) {
            // 디버그 모드에서만 상세 로깅
        }
        
        // 크래시 리포팅 초기화 (프로덕션에서)
        if (!BuildConfig.DEBUG) {
            // Firebase Crashlytics 등 초기화
        }
    }
}

