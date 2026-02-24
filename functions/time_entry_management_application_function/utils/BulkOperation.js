const axios = require("axios");
const csvtojson = require("csvtojson");
const catalyst = require("zcatalyst-sdk-node");
const ExcelJS = require("exceljs");
const unzipper = require('unzipper');

const PROJECT_ID = "17682000000037195";

const credentials = {
  BULKConnector: {
    client_id: "1000.MHJNQ4L3G2NIO4EBXKT86POD1WAI9J",
    client_secret: "4aa4cf841974ca7892568d8efdcdb369cc91693658",
    auth_url: "https://accounts.zoho.in/oauth/v2/token",
    refresh_url: "https://accounts.zoho.in/oauth/v2/token",
    refresh_token: "1000.73f3fefb5b7d68fe20d311577c4a5de0.98b5be286cbd47908796e79e4edf8015",
  },
};


async function getZohoAccessToken(req) {
  const catalystApp = catalyst.initialize(req);
  const cache = catalystApp.cache().segment();

  let accessToken = await cache.get("BULKConnector");
  if (!accessToken.cache_value) {
    try {
      accessToken = await catalystApp
        .connection(credentials)
        .getConnector("BULKConnector")
        .getAccessToken();
      if (accessToken) {
        await cache.put("BULKConnector", accessToken, 1); // Store for 1 hour
      }
    } catch (error) {
      console.error("Error generating Zoho access token:", error);
      return null;
    }
  } else {
  }
  return accessToken.cache_value;
}


async function createBulkReadJob(req, res) {
  const { tableName, criteria, columns } = req.body;
  // console.errorlog("aman");
  let ACCESS_TOKEN=await getZohoAccessToken(req);

  console.log("Access",ACCESS_TOKEN);

  let parsedCriteria = criteria;
  if (typeof criteria === "string") {
    try {
      parsedCriteria = JSON.parse(criteria);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON format for criteria" });
    }
  }

  try {
    const resp = await axios.post(
      `https://api.catalyst.zoho.in/baas/v1/project/${PROJECT_ID}/bulk/read`,
      {
        table_identifier: tableName,
        query: {
          page: 1,
          select_columns: columns || [],
          criteria: parsedCriteria,
        },
      },
      { headers: { Authorization: `Zoho-oauthtoken ${ACCESS_TOKEN}` } }
    );

    const jobId = resp.data?.data?.job_id;
    if (!jobId) {
      return res.status(500).json({ error: "Job ID not returned", details: resp.data });
    }
    return res.json({ jobId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create bulk read job", details: err.response?.data || err.message });
  }
}

async function checkBulkReadJobStatus(req, res) {
  const { jobId } = req.params;
  let ACCESS_TOKEN=await getZohoAccessToken(req);

  try {
    const resp = await axios.get(
      `https://api.catalyst.zoho.in/baas/v1/project/${PROJECT_ID}/bulk/read/${jobId}`,
      { headers: { Authorization: `Zoho-oauthtoken ${ACCESS_TOKEN}` } }
    );

    const status = resp.data?.data?.status || "UNKNOWN";
    return res.json({ status, details: resp.data.data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to get job status", details: err.response?.data || err.message });
  }
}

async function downloadBulkReadCSV(req, res) {
  const { jobId } = req.params;
  let ACCESS_TOKEN=await getZohoAccessToken(req);

  try {
    const response = await axios({
      method: 'get',
      url: `https://api.catalyst.zoho.in/baas/v1/project/${PROJECT_ID}/bulk/read/${jobId}/download`,
      headers: { Authorization: `Zoho-oauthtoken ${ACCESS_TOKEN}` },
      responseType: 'stream',
      timeout: 120000 // adjust timeout based on expected file size
    });

    const zipStream = response.data.pipe(unzipper.ParseOne());

    res.setHeader('Content-Disposition', 'attachment; filename="bulk_read_result.csv"');
    res.setHeader('Content-Type', 'text/csv');

    zipStream.on('error', (err) => {
      console.error('Streaming error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error extracting CSV from ZIP', details: err.message });
      }
    });

    zipStream.pipe(res);

  } catch (err) {
    console.error('Download error:', err);
    // Send meaningful safe error response avoiding circular JSON
    const errorMessage = err.message || 'Unknown error';
    const errorDetails = err.response && err.response.data ? err.response.data : undefined;
    if (!res.headersSent) {
      res.status(500).json({
        error: `Failed to download or extract bulk read result: ${errorMessage}`,
        details: errorDetails
      });
    }
  }
}


module.exports = {
  createBulkReadJob,
  checkBulkReadJobStatus,
  downloadBulkReadCSV,
};
