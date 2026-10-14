# Flutter / plugins : R8 doit conserver ce qui est appelé par réflexion.
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.embedding.** { *; }
-dontwarn io.flutter.embedding.**

# Google Play Billing (in_app_purchase)
-keep class com.android.billingclient.** { *; }
-keep class io.flutter.plugins.inapppurchase.** { *; }

# PostHog Analytics
-keep class com.posthog.** { *; }
-dontwarn com.posthog.**

# Google Play In-App Review & Update
-keep class com.google.android.play.core.** { *; }
-dontwarn com.google.android.play.core.**
-keep class dev.pushed.in_app_review.** { *; }

# OpenFileX & Share Plus
-keep class com.crazecoder.openfile.** { *; }
-keep class dev.fluttercommunity.plus.share.** { *; }

# Rust FFI & Native methods (libvectorpop_core.so)
-keepclasseswithmembernames class * {
    native <methods>;
}

# ONNX Runtime (suppression de fond)
-keep class ai.onnxruntime.** { *; }
-dontwarn ai.onnxruntime.**
