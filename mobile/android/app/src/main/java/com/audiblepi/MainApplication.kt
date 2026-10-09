package com.audiblepi

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ExpoReactHostFactory

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    // Expo's host wraps the default one so expo modules (av, file-system,
    // asset, keep-awake) and autolinked packages are registered.
    // jsMainModulePath is pinned to "index" so plain `react-native start`
    // keeps working (Expo's default virtual entry is expo-start only).
    ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
      jsMainModulePath = "index",
    )
  }

  override fun onCreate() {
    super.onCreate()
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
    loadReactNative(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
