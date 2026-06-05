package com.fysiki.trainingkitreactnative

import android.app.Application
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.fysiki.trainingkit.TrainingKit
import com.fysiki.trainingkit.utils.DeviceIdHelper

class TrainingKitModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    init {
        (reactContext.applicationContext as? Application)?.let { application ->
            TrainingKit.initialize(application)
        }
    }

    override fun getName(): String {
        return "TrainingKitModule"
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun deviceIdentifier(): String {
        return DeviceIdHelper.getDeviceId(reactContext)
    }

    @ReactMethod
    fun launchClassicWorkout(jsonString: String, token: String) {
        val intent = Intent(reactContext, ClassicWorkoutActivity::class.java).apply {
            putExtra("jsonString", jsonString)
            putExtra("token", token)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun launchVideoWorkout(jsonString: String, token: String) {
        val intent = Intent(reactContext, VideoWorkoutActivity::class.java).apply {
            putExtra("jsonString", jsonString)
            putExtra("token", token)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
    }
}

