package expo.modules.smsretriever

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.Status
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SmsRetrieverModule : Module() {
  private var receiver: BroadcastReceiver? = null

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("SmsRetriever")

    Events("onSms", "onTimeout")

    AsyncFunction("getAppHashes") { AppHash.compute(context) }

    // One call arms one listen window. Play services keeps it open for five
    // minutes or until one matching SMS arrives, whichever is first.
    AsyncFunction("start") { promise: Promise ->
      register()
      SmsRetriever.getClient(context)
        .startSmsRetriever()
        .addOnSuccessListener { promise.resolve(null) }
        .addOnFailureListener { error ->
          unregister()
          promise.reject("ERR_SMS_RETRIEVER_START", error.message, error)
        }
    }

    AsyncFunction("stop") { unregister() }

    OnDestroy { unregister() }
  }

  private fun register() {
    unregister()
    val created = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != SmsRetriever.SMS_RETRIEVED_ACTION) return
        val extras = intent.extras ?: return
        val status = extras.get(SmsRetriever.EXTRA_STATUS) as? Status ?: return
        when (status.statusCode) {
          CommonStatusCodes.SUCCESS -> {
            val message = extras.getString(SmsRetriever.EXTRA_SMS_MESSAGE) ?: return
            sendEvent("onSms", mapOf("message" to message))
          }
          CommonStatusCodes.TIMEOUT -> sendEvent("onTimeout", mapOf<String, Any?>())
        }
        // The window closes after one result either way.
        unregister()
      }
    }
    val filter = IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION)
    // The sender is Google Play services, not this app, so the receiver must
    // be exported and is guarded by the Play services send permission instead.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      context.registerReceiver(created, filter, SmsRetriever.SEND_PERMISSION, null, Context.RECEIVER_EXPORTED)
    } else {
      context.registerReceiver(created, filter, SmsRetriever.SEND_PERMISSION, null)
    }
    receiver = created
  }

  private fun unregister() {
    receiver?.let {
      runCatching { context.unregisterReceiver(it) }
    }
    receiver = null
  }
}
