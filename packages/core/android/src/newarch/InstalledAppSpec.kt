package com.installedapp

import com.facebook.react.bridge.ReactApplicationContext

abstract class InstalledAppSpec internal constructor(context: ReactApplicationContext) :
  NativeInstalledAppSpec(context) {
}
