# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor specific rules
-keep class com.getcapacitor.** { *; }
-keep class com.easecraft.financialcalculator.** { *; }

# Keep JavaScript interface classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
}

# Keep Capacitor plugin classes
-keep class * extends com.getcapacitor.Plugin

# Keep BridgeActivity and related classes
-keep class com.getcapacitor.BridgeActivity { *; }
-keep class com.getcapacitor.Bridge { *; }

# Keep WebView related classes for Capacitor
-keep class android.webkit.JavascriptInterface { *; }

# Preserve line number information for better crash reporting
-keepattributes SourceFile,LineNumberTable

# Keep custom application classes
-keep class * extends android.app.Application

# Keep activity classes
-keep class * extends android.app.Activity

# Preserve annotations
-keepattributes *Annotation*

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep parcelable classes
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}
