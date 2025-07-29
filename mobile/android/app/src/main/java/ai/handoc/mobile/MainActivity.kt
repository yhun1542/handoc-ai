package ai.handoc.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import dagger.hilt.android.AndroidEntryPoint
import ai.handoc.mobile.ui.theme.HanDocAITheme
import ai.handoc.mobile.ui.navigation.HanDocNavigation

/**
 * HanDoc AI 메인 액티비티
 * 
 * 앱의 진입점이며 Jetpack Compose UI를 호스팅합니다.
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // 스플래시 스크린 설치
        val splashScreen = installSplashScreen()
        
        super.onCreate(savedInstanceState)
        
        // Edge-to-edge 디스플레이 활성화
        enableEdgeToEdge()
        
        setContent {
            HanDocAITheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HanDocNavigation()
                }
            }
        }
        
        // 스플래시 스크린 조건 설정
        splashScreen.setKeepOnScreenCondition {
            // 초기화가 완료될 때까지 스플래시 유지
            false
        }
    }
}

