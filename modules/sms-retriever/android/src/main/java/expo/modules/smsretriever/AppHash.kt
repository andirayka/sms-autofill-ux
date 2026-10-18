package expo.modules.smsretriever

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Base64
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

/**
 * The 11-character hash Google Play services matches an SMS against. It is
 * derived from the package name and the signing certificate, so a different
 * package or a different keystore gives a different hash.
 */
internal object AppHash {
  private const val HASH_TYPE = "SHA-256"
  private const val HASH_BYTES = 9
  private const val HASH_LENGTH = 11

  fun compute(context: Context): List<String> {
    val packageName = context.packageName
    val packageManager = context.packageManager
    val signatures =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        packageManager
          .getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES)
          .signingInfo
          ?.apkContentsSigners
      } else {
        @Suppress("DEPRECATION")
        packageManager.getPackageInfo(packageName, PackageManager.GET_SIGNATURES).signatures
      } ?: return emptyList()

    return signatures.mapNotNull { signature ->
      val appInfo = "$packageName ${signature.toCharsString()}"
      val digest = MessageDigest.getInstance(HASH_TYPE).digest(appInfo.toByteArray(StandardCharsets.UTF_8))
      Base64.encodeToString(digest.copyOfRange(0, HASH_BYTES), Base64.NO_PADDING or Base64.NO_WRAP)
        .take(HASH_LENGTH)
    }
  }
}
