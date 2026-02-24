require("dotenv").config(); 
const express = require("express");
const catalyst = require("zcatalyst-sdk-node");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "15mb" })); 
app.use(cors());

const CATALYST_ORG_ID = process.env.ORG_ID;

// Zoho endpoints
const RAG_ENDPOINT =
  "https://api.catalyst.zoho.in/quickml/v1/project/17682000000037195/rag/answer";
const LLM_ENDPOINT =
  "https://api.catalyst.zoho.in/quickml/v2/project/17682000000037195/llm/chat";
const VLM_ENDPOINT =
  "https://api.catalyst.zoho.in/quickml/v1/project/17682000000037195/vlm/chat";

/**
 * Get Zoho Access Token
 */
async function getZohoAccessToken(req) {
  const env = process.env.ENVIRONMENT || "DEVELOPMENT";
  const refreshToken =
    env === "PRODUCTION"
      ? process.env.REFRESH_TOKEN_PROD
      : process.env.REFRESH_TOKEN_DEV;

  if (!refreshToken) throw new Error("Zoho Refresh Token not configured");

  const credentials = {
    AIConnector: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      auth_url: "https://accounts.zoho.in/oauth/v2/token",
      refresh_url: "https://accounts.zoho.in/oauth/v2/token",
      refresh_token: refreshToken,
    },
  };

  const catalystApp = catalyst.initialize(req);
  const cache = catalystApp.cache().segment();

  try {
    const cached = await cache.get("AIConnector");
    if (cached?.cache_value) return cached.cache_value;

    const newToken = await catalystApp
      .connection(credentials)
      .getConnector("AIConnector")
      .getAccessToken();

    if (!newToken) throw new Error("Failed to fetch Zoho Access Token");

    await cache.put("AIConnector", newToken, 1); 
    return newToken;
  } catch (error) {
    throw new Error("Zoho Access Token retrieval failed: " + error.message);
  }
}

/**
 * API Error Handler
 */
function handleAPIError(error, type) {
  if (error.response) {
    return {
      success: false,
      status: error.response.status,
      message:
        error.response.data?.message ||
        `Zoho Catalyst ${type} API responded with an error`,
      details: error.response.data,
    };
  } else if (error.request) {
    return {
      success: false,
      status: 504,
      message: `No response from ${type} API. Please try again later.`,
    };
  } else {
    return { success: false, status: 500, message: error.message };
  }
}

/**
 * Fetch RAG Answer
 */
async function fetchRagAnswer(req, query, documents = []) {
  if (!query || typeof query !== "string" || query.trim() === "")
    throw new Error("Invalid query — must be a non-empty string");
  if (!Array.isArray(documents) || documents.length === 0)
    throw new Error("Documents array must contain at least one document ID");

  const token = await getZohoAccessToken(req);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Zoho-oauthtoken ${token}`,
    "CATALYST-ORG": CATALYST_ORG_ID,
  };

  try {
    const res = await axios.post(RAG_ENDPOINT, { query, documents }, { headers });
    const { response, retrieved_nodes, status } = res.data;

    const sources = (retrieved_nodes || []).map((node) => ({
      title: node.document_title,
      id: node.document_id,
    }));

    return {
      success: status,
      query,
      answer: response || "No answer found.",
      metadata: { model: "DSV-AI", sources },
    };
  } catch (error) {
    return handleAPIError(error, "RAG");
  }
}

/**
 * Fetch LLM Answer (Text, Code, Vision)
 */
async function fetchLLMAnswer(req, payload) {
  const { prompt, model_type, images = [] } = payload;

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "")
    throw new Error("Invalid prompt — must be a non-empty string");

  const token = await getZohoAccessToken(req);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Zoho-oauthtoken ${token}`,
    "CATALYST-ORG": CATALYST_ORG_ID,
  };

  let body = {};
  let endpoint = "";

  switch (model_type) {
    case "text":
      endpoint = LLM_ENDPOINT;
      body = {
        prompt,
        model: "crm-di-qwen_text_14b-fp8-it",
        system_prompt: "Be concise and factual",
        top_p: 0.9,
        top_k: 50,
        best_of: 1,
        temperature: 0.7,
        max_tokens: 256,
      };
      break;

    case "code":
      endpoint = LLM_ENDPOINT;

      body = {
        model: "crm-di-qwen_coder_7b-it",
        prompt,
        system_prompt:
          "You are a code reviewer. Provide syntax verification and improvement suggestions.",
        top_p: 0.95,
        top_k: 120,
        max_tokens: 1000,
        temperature: 1,
      };
      break;

    case "vision":
      if (!Array.isArray(images) || images.length === 0)
        throw new Error(
          "Images must be provided as an array of base64 strings for vision model"
        );
      endpoint = VLM_ENDPOINT;
      body = {
        prompt,
        model: "VL-Qwen2.5-7B",
        images,
        system_prompt: "Be concise and factual",
        top_p: 0.9,
        top_k: 50,
        temperature: 0.7,
        max_tokens: 500,
      };
      break;

    default:
      throw new Error(
        "Invalid model_type. Must be one of 'text', 'code', or 'vision'"
      );
  }

  try {
    const res = await axios.post(endpoint, body, { headers });
    return {
      success: true,
      model_type,
      prompt,
      answer: res.data.response || "No answer found",
      metadata: { model: body.model },
    };
  } catch (error) {
    return handleAPIError(error, "LLM");
  }
}

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Zoho Catalyst RAG & LLM API Service" });
});

app.post("/api/rag/answer", async (req, res) => {
  try {
    const { query, documents } = req.body;
    const result = await fetchRagAnswer(req, query, documents);
    res.status(result.success ? 200 : result.status || 500).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/llm/answer", async (req, res) => {
  try {
    const { prompt, model_type, images } = req.body;
    const result = await fetchLLMAnswer(req, { prompt, model_type, images });
    res.status(result.success ? 200 : result.status || 500).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
