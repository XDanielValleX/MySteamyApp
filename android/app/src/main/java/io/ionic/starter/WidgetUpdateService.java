package io.ionic.starter;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;
import androidx.core.app.JobIntentService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WidgetUpdateService extends JobIntentService {

  public static final String ACTION_REFRESH = "io.ionic.starter.WIDGET_REFRESH";
  private static final int JOB_ID = 2001;
  private static final String EXTRA_WIDGET_IDS = "widget_ids";
  private static final int FLIP_INTERVAL_MS = 5000;
  private static final int MAX_ROTATIONS = 12;

  public static void enqueueWork(Context context) {
    Intent intent = new Intent(context, WidgetUpdateService.class);
    enqueueWork(context, WidgetUpdateService.class, JOB_ID, intent);
  }

  public static void enqueueWork(Context context, int[] appWidgetIds) {
    Intent intent = new Intent(context, WidgetUpdateService.class);
    intent.putExtra(EXTRA_WIDGET_IDS, appWidgetIds);
    enqueueWork(context, WidgetUpdateService.class, JOB_ID, intent);
  }

  @Override
  protected void onHandleWork(@NonNull Intent intent) {
    AppWidgetManager manager = AppWidgetManager.getInstance(this);

    int[] ids = intent.getIntArrayExtra(EXTRA_WIDGET_IDS);
    if (ids == null || ids.length == 0) {
      ids = manager.getAppWidgetIds(new ComponentName(this, GameWidget.class));
    }
    if (ids.length == 0) return;

    String favoriteId = readFavoriteId(this);
    if (favoriteId == null || favoriteId.isEmpty()) {
      showEmptyState(manager, ids);
      return;
    }

    try {
      Map<String, Store> stores = fetchStores();
      GameData gameData = fetchGameDetails(favoriteId);

      if (gameData == null || gameData.deals.isEmpty()) {
        showEmptyState(manager, ids);
        return;
      }

      Bitmap bg = fetchBitmap(gameData.thumbUrl);
      Map<String, Bitmap> logoCache = new HashMap<>();

      int rotations = Math.min(MAX_ROTATIONS, Math.max(1, gameData.deals.size()));
      for (int i = 0; i < rotations; i++) {
        int index = i % gameData.deals.size();
        for (int appWidgetId : ids) {
          updateWidget(manager, appWidgetId, gameData, stores, logoCache, bg, index);
        }
        SystemClock.sleep(FLIP_INTERVAL_MS);
      }
    } catch (Exception e) {
      showEmptyState(manager, ids);
    }
  }

  private void updateWidget(AppWidgetManager manager, int appWidgetId, GameData data,
                            Map<String, Store> stores, Map<String, Bitmap> logoCache,
                            Bitmap bg, int index) {

    RemoteViews views = new RemoteViews(getPackageName(), R.layout.game_widget);

    Deal dealA = data.deals.get(index);
    Deal dealB = data.deals.get((index + 1) % data.deals.size());

    views.setViewVisibility(R.id.widget_empty, View.GONE);
    views.setViewVisibility(R.id.widget_flipper, View.VISIBLE);
    views.setTextViewText(R.id.widget_title, data.title);

    if (bg != null) {
      views.setImageViewBitmap(R.id.widget_bg, bg);
    }

    bindDeal(views, dealA, stores, logoCache, true);
    bindDeal(views, dealB, stores, logoCache, false);

    int displayed = (index % 2 == 0) ? 0 : 1;
    views.setDisplayedChild(R.id.widget_flipper, displayed);

    Intent launch = new Intent(this, MainActivity.class);
    PendingIntent pending = PendingIntent.getActivity(
      this, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );
    views.setOnClickPendingIntent(R.id.widget_root, pending);

    manager.updateAppWidget(appWidgetId, views);
  }

  private void bindDeal(RemoteViews views, Deal deal, Map<String, Store> stores,
                        Map<String, Bitmap> logoCache, boolean isA) {

    int storeNameId = isA ? R.id.store_name_a : R.id.store_name_b;
    int storeLogoId = isA ? R.id.store_logo_a : R.id.store_logo_b;
    int priceId = isA ? R.id.price_a : R.id.price_b;
    int normalId = isA ? R.id.normal_price_a : R.id.normal_price_b;
    int savingsId = isA ? R.id.savings_a : R.id.savings_b;

    Store store = stores.get(deal.storeId);
    String storeName = store != null ? store.name : "Store";

    views.setTextViewText(storeNameId, storeName);
    views.setTextViewText(priceId, "$" + deal.price);
    views.setTextViewText(normalId, "$" + deal.retailPrice);
    views.setTextViewText(savingsId, "-" + Math.round(deal.savings) + "%");

    if (store != null && store.logoUrl != null) {
      Bitmap logo = logoCache.get(store.logoUrl);
      if (logo == null) {
        logo = fetchBitmap(store.logoUrl);
        if (logo != null) {
          logoCache.put(store.logoUrl, logo);
        }
      }
      if (logo != null) {
        views.setImageViewBitmap(storeLogoId, logo);
      }
    }
  }

  private void showEmptyState(AppWidgetManager manager, int[] ids) {
    for (int id : ids) {
      RemoteViews views = new RemoteViews(getPackageName(), R.layout.game_widget);
      views.setTextViewText(R.id.widget_title, "My Steamy App");
      views.setViewVisibility(R.id.widget_flipper, View.GONE);
      views.setViewVisibility(R.id.widget_empty, View.VISIBLE);
      manager.updateAppWidget(id, views);
    }
  }

  private String readFavoriteId(Context context) {
    SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
    return prefs.getString("favoriteGame", null);
  }

  private Map<String, Store> fetchStores() throws Exception {
    String json = readUrl("https://www.cheapshark.com/api/1.0/stores");
    JSONArray arr = new JSONArray(json);
    Map<String, Store> map = new HashMap<>();
    for (int i = 0; i < arr.length(); i++) {
      JSONObject obj = arr.getJSONObject(i);
      Store store = new Store();
      store.id = obj.getString("storeID");
      store.name = obj.optString("storeName", "Store");
      JSONObject images = obj.optJSONObject("images");
      if (images != null) {
        store.logoUrl = "https://www.cheapshark.com" + images.optString("logo", "");
      }
      map.put(store.id, store);
    }
    return map;
  }

  private GameData fetchGameDetails(String gameId) throws Exception {
    String json = readUrl("https://www.cheapshark.com/api/1.0/games?id=" + gameId);
    JSONObject root = new JSONObject(json);

    JSONObject info = root.getJSONObject("info");
    GameData data = new GameData();
    data.title = info.optString("title", "Favorite");
    data.thumbUrl = info.optString("thumb", "");

    JSONArray deals = root.optJSONArray("deals");
    if (deals == null) return data;

    for (int i = 0; i < deals.length(); i++) {
      JSONObject d = deals.getJSONObject(i);
      Deal deal = new Deal();
      deal.storeId = d.optString("storeID", "");
      deal.price = d.optString("price", "0.00");
      deal.retailPrice = d.optString("retailPrice", "0.00");
      deal.savings = (float) d.optDouble("savings", 0.0);
      data.deals.add(deal);
    }
    return data;
  }

  private String readUrl(String urlStr) throws Exception {
    HttpURLConnection connection = null;
    InputStream in = null;
    try {
      URL url = new URL(urlStr);
      connection = (HttpURLConnection) url.openConnection();
      connection.setConnectTimeout(10000);
      connection.setReadTimeout(10000);
      in = new BufferedInputStream(connection.getInputStream());

      BufferedReader reader = new BufferedReader(new InputStreamReader(in));
      StringBuilder sb = new StringBuilder();
      String line;
      while ((line = reader.readLine()) != null) {
        sb.append(line);
      }
      return sb.toString();
    } finally {
      if (in != null) in.close();
      if (connection != null) connection.disconnect();
    }
  }

  private Bitmap fetchBitmap(String urlStr) {
    if (urlStr == null || urlStr.isEmpty()) return null;
    HttpURLConnection connection = null;
    InputStream in = null;
    try {
      URL url = new URL(urlStr);
      connection = (HttpURLConnection) url.openConnection();
      connection.setConnectTimeout(10000);
      connection.setReadTimeout(10000);
      in = connection.getInputStream();
      return BitmapFactory.decodeStream(in);
    } catch (Exception e) {
      return null;
    } finally {
      try {
        if (in != null) in.close();
      } catch (Exception ignored) {}
      if (connection != null) connection.disconnect();
    }
  }

  private static class Store {
    String id;
    String name;
    String logoUrl;
  }

  private static class Deal {
    String storeId;
    String price;
    String retailPrice;
    float savings;
  }

  private static class GameData {
    String title;
    String thumbUrl;
    List<Deal> deals = new ArrayList<>();
  }
}
