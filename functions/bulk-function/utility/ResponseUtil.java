package utility;
import java.io.IOException;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;

public class ResponseUtil {
    public static void handleServerError(HttpServletResponse response, Exception e) throws IOException {
        sendResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error");
    }

    public static void sendResponse(HttpServletResponse response, int statusCode, String message) throws IOException {
        response.setStatus(statusCode);
        response.getWriter().write(message);
    }

    public static void sendJsonError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        response.setContentType("application/json");
        JSONObject errorJson = new JSONObject();
        errorJson.put("error", message);
        response.getWriter().write(errorJson.toJSONString());
    }
}
