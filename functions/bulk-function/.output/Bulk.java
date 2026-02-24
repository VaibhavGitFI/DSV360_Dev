import java.util.logging.Logger;
import java.util.logging.Level;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.catalyst.advanced.CatalystAdvancedIOHandler;
import com.zc.common.ZCProject;

import controllers.BulkController;
import utility.GetAccessToken;

public class Bulk implements CatalystAdvancedIOHandler {
    private static final Logger LOGGER = Logger.getLogger(Bulk.class.getName());
    private final BulkController controller = new BulkController();

    @Override
    public void runner(HttpServletRequest request, HttpServletResponse response) throws Exception {
        try {
            ZCProject.initProject();
            String path = request.getRequestURI();
            String method = request.getMethod();

            if(path.startsWith("/server/bulk-function")){
                String prefix = "/server/bulk-function";
                String newPath=null;
                if (path.length() > prefix.length()) {
                    newPath = path.substring(prefix.length());
                }
                path=newPath;
            }

            // Routing logic
            if (path.equals("/bulk/create") && "POST".equalsIgnoreCase(method)) {
                controller.createBulkJob(request, response);

            } else if (path.startsWith("/bulk/status") && "GET".equalsIgnoreCase(method)) {
                String prefix = "/bulk/status/";
                String jobId = null;
                if (path.length() > prefix.length()) {
                    jobId = path.substring(prefix.length());
                }
                controller.checkBulkStatus(request, response,jobId);

            } else if (path.startsWith("/bulk/download") && "POST".equalsIgnoreCase(method)) {
    
                String prefix = "/bulk/download/";
                String jobId = null;
                if (path.length() > prefix.length()) {
                    jobId = path.substring(prefix.length());
                }

                if (jobId == null || jobId.isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Missing jobId in path\"}");
                    return;
                }

                controller.downloadBulkReadCSV(request, response, jobId);

            } else if (path.equals("/token")) {
                response.setStatus(200);
                response.setContentType("application/json");
                response.getWriter().write(GetAccessToken.getZohoAccessToken());

            } else if (path.equals("/test")) {
                controller.handleRootRequest(request, response);

            } else {
                controller.handleNotFound(response);
            }

        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Exception in Bulk", e);
            if (!response.isCommitted()) {
                response.setStatus(500);
                response.getWriter().write("{\"error\":\"Internal server error\"}");
            }
        }
    }
}
