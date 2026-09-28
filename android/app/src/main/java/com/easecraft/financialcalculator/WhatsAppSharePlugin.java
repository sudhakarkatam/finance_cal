package com.easecraft.financialcalculator;

import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

@CapacitorPlugin(name = "WhatsAppShare")
public class WhatsAppSharePlugin extends Plugin {
    @PluginMethod
    public void sharePdf(PluginCall call) {
        String fileUrl = call.getString("url");
        String text = call.getString("text");
        String title = call.getString("title");

        try {
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("application/pdf");

            // Detect regular WhatsApp or WhatsApp Business
            PackageManager pm = getContext().getPackageManager();
            String targetPackage = null;
            try {
                pm.getPackageInfo("com.whatsapp", PackageManager.GET_ACTIVITIES);
                targetPackage = "com.whatsapp";
            } catch (Exception e1) {
                try {
                    pm.getPackageInfo("com.whatsapp.w4b", PackageManager.GET_ACTIVITIES);
                    targetPackage = "com.whatsapp.w4b";
                } catch (Exception e2) {
                    targetPackage = null;
                }
            }

            if (targetPackage == null) {
                call.reject("WhatsApp is not installed on this device");
                return;
            }

            intent.setPackage(targetPackage);

            if (fileUrl != null) {
                Uri fileUri = FileProvider.getUriForFile(
                    getActivity(),
                    getContext().getPackageName() + ".fileprovider",
                    new File(Uri.parse(fileUrl).getPath())
                );
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    intent.setClipData(ClipData.newRawUri("", fileUri));
                }
                intent.putExtra(Intent.EXTRA_STREAM, fileUri);
            }

            if (text != null) {
                intent.putExtra(Intent.EXTRA_TEXT, text);
            }
            if (title != null) {
                intent.putExtra(Intent.EXTRA_SUBJECT, title);
            }

            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception ex) {
            call.reject("Failed to open WhatsApp: " + ex.getMessage());
        }
    }
}
