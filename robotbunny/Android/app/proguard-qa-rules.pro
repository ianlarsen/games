# Instrumentation needs this shared library even though app-only R8 can remove it.
-keep class androidx.tracing.** { *; }
# The instrumentation APK shares Kotlin support classes with the target app.
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-keepclassmembers class com.primeresolvesolutions.robotbunny.MainActivity { static boolean isLocal(android.net.Uri); }
