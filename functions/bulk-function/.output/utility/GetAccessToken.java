package utility;

import com.zc.component.cache.ZCCache;
import com.zc.component.cache.ZCCacheObject;
import com.zc.component.cache.ZCSegment;
import org.json.simple.JSONObject;
import com.zc.auth.connectors.ZCConnection;
import com.zc.auth.connectors.ZCConnector;

public class GetAccessToken {

    public static String getZohoAccessToken() {
        try {
            // Initialize cache and segment
            ZCCache cache = ZCCache.getInstance();
            ZCSegment segment = cache.getSegmentInstance(17682000000037236L);

            // Try to fetch from cache
            ZCCacheObject cachedObj = segment.getCacheObject("BULKConnector");
            System.out.println("Aman"+cachedObj.getValue());


            if (cachedObj != null && cachedObj.getValue() != null) {
                return cachedObj.getValue();
            }

            // Build auth JSON
            JSONObject authJson = new JSONObject();
            authJson.put("client_id", "1000.MHJNQ4L3G2NIO4EBXKT86POD1WAI9J");
            authJson.put("client_secret", "4aa4cf841974ca7892568d8efdcdb369cc91693658");
            authJson.put("auth_url", "https://accounts.zoho.in/oauth/v2/token");
            authJson.put("refresh_url", "https://accounts.zoho.in/oauth/v2/token");
            authJson.put("refresh_token", "1000.73f3fefb5b7d68fe20d311577c4a5de0.98b5be286cbd47908796e79e4edf8015");
            authJson.put("refresh_in", "3600"); // seconds

            // Define connector JSON
            JSONObject connectorJson = new JSONObject();
            connectorJson.put("BULKConnector", authJson);

            // Create a connection
            ZCConnection conn = ZCConnection.getInstance(connectorJson);

            // Get your connector
            ZCConnector bulkConnector = conn.getConnector("BULKConnector");

            // Fetch the access token
            String accessToken = bulkConnector.getAccessToken();

            // Store in cache for 1 hour
            ZCCacheObject cacheDetails = ZCCacheObject.getInstance();
            cacheDetails.setKeyName("BULKConnector");
            cacheDetails.setValue(accessToken);
            cacheDetails.setExpiryInHours(1L);

            segment.putCacheObject(cacheDetails);

            return accessToken;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
