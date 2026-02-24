package controllers;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;

import utility.*;

public class BulkController {
    private static final String PROJECT_ID = "17682000000037195";
    private static final String env = System.getenv("Environment") != null ? System.getenv("Environment") : "Development";

    public void createBulkJob(HttpServletRequest request, HttpServletResponse response) throws Exception {
        response.setContentType("application/json");

        try {

            String reqBody=RequestUtil.fetchRequestBody(request);
            JSONObject bodyJson = (JSONObject) new JSONParser().parse(reqBody);

            String tableName = (String) bodyJson.get("tableName").toString();
            Object criteriaObj = bodyJson.get("criteria");
            JSONArray columns = (JSONArray) bodyJson.get("columns");

            String ACCESS_TOKEN = GetAccessToken.getZohoAccessToken();
            if (ACCESS_TOKEN == null) {
                response.setStatus(401);
                response.getWriter().write("{\"error\":\"Unable to generate access token\"}");
                return;
            }

            // Build request payload
            JSONObject query = new JSONObject();
            query.put("page", "1");
            query.put("select_columns", columns != null ? columns : new JSONArray());
            query.put("criteria", criteriaObj);

            JSONObject payload = new JSONObject();
            payload.put("table_identifier", tableName);
            payload.put("query", query);

            // Make POST request
            URL url = new URL("https://api.catalyst.zoho.in/baas/v1/project/" + PROJECT_ID + "/bulk/read");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Zoho-oauthtoken " + ACCESS_TOKEN);
            conn.setRequestProperty("Environment",env);
            conn.setRequestProperty("CATALYST-ORG", "60040289923");

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = payload.toString().getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // Read response
            int status = conn.getResponseCode();
            InputStream is = (status >= 200 && status < 300) ? conn.getInputStream() : conn.getErrorStream();

            BufferedReader in = new BufferedReader(new InputStreamReader(is));
            StringBuilder respSb = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                respSb.append(line);
            }
            in.close();

            JSONObject respJson = (JSONObject) new JSONParser().parse(respSb.toString());

            // Extract jobId
            JSONObject data = (JSONObject) respJson.get("data");
            String jobId = (data != null && data.get("job_id") != null) ? data.get("job_id").toString() : null;


            if (jobId == null) {
                response.setStatus(500);
                JSONObject errorJson = new JSONObject();
                errorJson.put("error", "Job ID not returned");
                errorJson.put("details", respJson);
                response.getWriter().write(errorJson.toString());
            } else {
                JSONObject successJson = new JSONObject();
                successJson.put("jobId", jobId);
                response.setStatus(200);
                response.getWriter().write(successJson.toString());
            }

        } catch (Exception e) {
            response.setStatus(500);
            JSONObject errorJson = new JSONObject();
            errorJson.put("error", "Failed to create bulk read job");
            errorJson.put("details", e.getMessage());
            response.getWriter().write(errorJson.toString());
        }
    }

    public void checkBulkStatus(HttpServletRequest request, HttpServletResponse response,String jobID) throws IOException{
            try{
                String ACCESS_TOKEN=GetAccessToken.getZohoAccessToken();

                String url = "https://api.catalyst.zoho.in/baas/v1/project/" + PROJECT_ID + "/bulk/read/" + jobID;
                HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Authorization", "Zoho-oauthtoken " + ACCESS_TOKEN);
                conn.setRequestProperty("Environment",env);
               conn.setRequestProperty("CATALYST-ORG", "60040289923");

                int responseCode = conn.getResponseCode();
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));

                StringBuilder bulkStatusResp = new StringBuilder();
                String inputLine;
                while ((inputLine = in.readLine()) != null) bulkStatusResp.append(inputLine);
                in.close();
                
                
                JSONParser parser = new JSONParser();
                JSONObject jsonResponse = (JSONObject) parser.parse(bulkStatusResp.toString());
                JSONObject data = (JSONObject) jsonResponse.get("data");
                
                String status = "UNKNOWN";
                if (data != null && data.get("status") != null) {
                    status = data.get("status").toString();
                }

                // Return equivalent of res.json({ status, details: resp.data.data })
               
                
                JSONObject successJson=new JSONObject();
                successJson.put("status", status);
                successJson.put("details", data);
                response.setStatus(200);
                response.getWriter().write(successJson.toString());
        
            }catch(Exception e){
                response.setStatus(500);
                JSONObject errorJson = new JSONObject();
                errorJson.put("error", "Failed to check bulk status job");
                errorJson.put("details", e);
                response.getWriter().write(errorJson.toString());

            }
            


    }

    public void downloadBulkReadCSV(HttpServletRequest request, HttpServletResponse response, String jobId) throws IOException {
        HttpURLConnection conn = null;
        ZipInputStream zis = null;
        
        try {
            if (jobId == null || jobId.isEmpty()) {
                ResponseUtil.sendJsonError(response, "Missing jobId in URL");
                return;
            }

            String reqBody = RequestUtil.fetchRequestBody(request);
            if (reqBody == null || reqBody.trim().isEmpty()) {
                ResponseUtil.sendJsonError(response, "TableName is missing");
                return;
            }

            org.json.JSONObject reqJson = new org.json.JSONObject(reqBody);
            String tableName = reqJson.getString("tableName");
            String accessToken = GetAccessToken.getZohoAccessToken();

            String urlStr = "https://api.catalyst.zoho.in/baas/v1/project/" + PROJECT_ID + "/bulk/read/" + jobId + "/download";
            conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Zoho-oauthtoken " + accessToken);
            conn.setConnectTimeout(120_000);
            conn.setReadTimeout(120_000);
            conn.setRequestProperty("Environment", env);
            conn.setRequestProperty("CATALYST-ORG", "60040289923");

            int responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                String errMsg = HelperUtil.readStream(conn.getErrorStream());
                ResponseUtil.sendJsonError(response, "Failed to download bulk CSV: " + errMsg);
                return;
            }

            zis = new ZipInputStream(conn.getInputStream());
            ZipEntry entry = zis.getNextEntry();
            if (entry == null) {
                ResponseUtil.sendJsonError(response, "ZIP file is empty");
                return;
            }

            // Modify and write CSV
            CSVModified(tableName,zis, response);

        } catch (Exception e) {
            e.printStackTrace();
            if (!response.isCommitted()) {
                response.reset();
                ResponseUtil.sendJsonError(response, "Error processing CSV: " + e.getMessage());
            }
        } finally {
            if (zis != null) try { zis.close(); } catch (IOException ignored) {}
            if (conn != null) conn.disconnect();
        }
    }

    
private void CSVModified(String tableName, InputStream csvStream, HttpServletResponse response) throws IOException {
    BufferedReader reader = new BufferedReader(new InputStreamReader(csvStream));
    List<String[]> rows = new ArrayList<>();
    String header = reader.readLine();

    if (header == null) {
        ResponseUtil.sendJsonError(response, "CSV is empty");
        return;
    }

    response.setHeader("Content-Disposition", "attachment; filename=\"export.csv\"");
    response.setContentType("text/csv");
    BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(response.getOutputStream()));

    String line;
    while ((line = reader.readLine()) != null) {
        rows.add(line.split(",", -1));
    }


    if ("Time_Entries".equalsIgnoreCase(tableName)) {
        String[] headerCols = header.split(",", -1);
        swap(headerCols, 0, 1); // Swap Start_time and End_time
        String[] newHeaderCols = new String[headerCols.length + 1];
        newHeaderCols[0] = "S_No";
        System.arraycopy(headerCols, 0, newHeaderCols, 1, headerCols.length);
        String newHeader = String.join(",", newHeaderCols);

        // Swap & sort by Entry_Date (index 4) then Start_time (index 1)
        for (String[] row : rows) swap(row, 0, 1);
        rows.sort((a, b) -> {
            int dateCompare = a[4].compareTo(b[4]);
            if (dateCompare != 0) return dateCompare;
            return a[1].compareTo(b[1]);
        });

        writer.write(newHeader);
        writer.newLine();

        int rowNum = 1;
        int totalMinutesSum = 0;
        int totalBillable = 0;

        for (String[] row : rows) {
            int totalMinutes = 0;
            try {
                totalMinutes = Integer.parseInt(row[7].replaceAll("\"", ""));
            } catch (NumberFormatException ignored) {}

            totalMinutesSum += totalMinutes;
            String type = row[8].replace("\"", "").trim();
            if ("Billable".equalsIgnoreCase(type)) {
                totalBillable += totalMinutes;
            }

            String[] outRow = new String[row.length + 1];
            outRow[0] = String.valueOf(rowNum++);
            for (int i = 0; i < row.length; i++) {
                if (i == 7) {
                    outRow[i + 1] = formatMinutesToHrMin(totalMinutes);
                } else {
                    outRow[i + 1] = row[i];
                }
            }

            writer.write(String.join(",", outRow));
            writer.newLine();
        }

        writer.write(",,,,,,,Overall TotalTime," + formatMinutesToHrMin(totalMinutesSum));
        writer.newLine();
        writer.write(",,,,,,,Overall Billable Time," + formatMinutesToHrMin(totalBillable));
        writer.newLine();
        writer.write(",,,,,,,Overall Non-Billable Time," + formatMinutesToHrMin(totalMinutesSum - totalBillable));
        writer.newLine();
    }

    // --- CASE 2: Projects ---
    else if ("Projects".equalsIgnoreCase(tableName)) {
        // Header order: Status,Assigned_To,Client_Name,Owner,Project_Name,Start_Date,End_Date,Assigned_To_Id
        int startDateIndex = 5; // Start_Date column index
        rows.sort(Comparator.comparing(a -> a[startDateIndex]));

        writer.write(header);
        writer.newLine();
        for (String[] row : rows) {
            writer.write(String.join(",", row));
            writer.newLine();
        }
    }

    // --- CASE 3: Other Tables ---
    else {
        writer.write(header);
        writer.newLine();
        for (String[] row : rows) {
            writer.write(String.join(",", row));
            writer.newLine();
        }
    }

    writer.flush();
    writer.close();
}

    // Swap two elements in array
    private void swap(String[] arr, int i, int j) {
        String tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    private String formatMinutesToHrMin(int minutes) {
        int hrs = minutes / 60;
        int mins = minutes % 60;
        return String.format("%02d hr %02d min", hrs, mins);
    }


    

    public void handleRootRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String name = request.getParameter("name");
        if (name == null || name.isEmpty()) {
            name = "Guest";
        }
        ResponseUtil.sendResponse(response, HttpServletResponse.SC_OK, "Hello " + name + " from Bulk.java");
    }

    public void handleNotFound(HttpServletResponse response) throws IOException {
        ResponseUtil.sendResponse(response, HttpServletResponse.SC_NOT_FOUND,
                "You might find the page you are looking for at \"/\" path");
    }
}
