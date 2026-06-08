package com.fysiki.trainingkitreactnative

import android.app.Application
import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.fysiki.trainingkit.TrainingKit
import com.fysiki.trainingkit.utils.DeviceIdHelper

class TrainingKitModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    init {
        currentContext = reactContext
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

    // Required by NativeEventEmitter; the bookkeeping itself is handled in JS.
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    companion object {
        private const val WORKOUT_EVENT = "TrainingKitWorkoutEvent"
        private var currentContext: ReactApplicationContext? = null

        private fun emit(body: WritableMap) {
            val context = currentContext ?: return
            try {
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(WORKOUT_EVENT, body)
            } catch (_: Exception) {
                // No active React instance / no JS listener yet.
            }
        }

        fun emitSave(dataJson: String) {
            emit(
                Arguments.createMap().apply {
                    putString("type", "save")
                    putString("data", dataJson)
                },
            )
        }

        fun emitQuit() {
            emit(Arguments.createMap().apply { putString("type", "quit") })
        }

        fun emitEvent(name: String, propertiesJson: String) {
            emit(
                Arguments.createMap().apply {
                    putString("type", "event")
                    putString("name", name)
                    putString("properties", propertiesJson)
                },
            )
        }
    }
}
