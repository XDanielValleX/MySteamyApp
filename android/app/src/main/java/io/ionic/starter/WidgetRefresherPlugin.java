package io.ionic.starter;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name = "WidgetRefresher")
public class WidgetRefresherPlugin extends Plugin {

    @PluginMethod
    public void refresh(PluginCall call) {
        String favoriteId = call.getString("favoriteId");
        // Si favoriteId es una cadena vacía, pasarla como tal
        // (null significa "no se pasó", "" significa "limpiar el widget")
        WidgetUpdateService.enqueueWork(getContext(), favoriteId);
        call.resolve();
    }
}
