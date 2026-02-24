import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Bot, Brain } from "lucide-react";
import axios from "axios";
import { Send, Add } from "@mui/icons-material";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Avatar,
  Stack,
  useTheme,
} from "@mui/material";

/* --------------------------- Models list (exact ids you shared) --------------------------- */
const AVAILABLE_MODELS = [
  {
    key: "text",
    label: "Text Model — crm-di-qwen_text_14b-fp8-it",
    model: "crm-di-qwen_text_14b-fp8-it",
  },
  {
    key: "code",
    label: "Code Model — crm-di-qwen_coder_7b-it",
    model: "crm-di-qwen_coder_7b-it",
  },
  {
    key: "vision",
    label: "Vision Model — VL-Qwen2.5-7B",
    model: "VL-Qwen2.5-7B",
  },
];

/* --------------------------- Helper: Apply Bold Formatting --------------------------- */
const applyBold = (text, keyPrefix) => {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={`${keyPrefix}-${match.index}`}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts;
};

/* --------------------------- Render formatted text (FIXED for FENCED CODE/MATH BLOCKS) --------------------------- */
const renderFormattedText = (text = "") => {
  const lines = text.split("\n");
  const blocks = [];
  let currentList = [];
  let listType = null; // 'numbered' or 'bullet'
  let inCodeBlock = false;
  let currentCodeLines = [];
  let inMathBlock = false; // New state for Math/LaTeX

  const finishList = (key) => {
    if (currentList.length === 0) return;

    if (listType === 'numbered') {
      blocks.push(
        <ol key={`ol-block-${key}`} className="list-decimal ml-8 mt-2 mb-2 text-gray-800">
          {currentList}
        </ol>
      );
    } else if (listType === 'bullet') {
      blocks.push(
        <ul key={`ul-block-${key}`} className="list-disc ml-8 mt-2 mb-2 text-gray-700">
          {currentList}
        </ul>
      );
    }
    currentList = [];
    listType = null;
  };
  
  const finishCodeBlock = (key, isMath = false) => {
      const codeContent = currentCodeLines.join('\n');
      
      const className = isMath 
          ? "bg-gray-100 text-gray-800 p-4 rounded-lg overflow-x-auto my-3 text-lg font-mono text-center border border-indigo-200"
          : "bg-gray-800 text-gray-200 p-3 rounded-lg overflow-x-auto my-3 text-sm font-mono shadow-inner";

      blocks.push(
          <pre 
              key={`code-block-${key}`} 
              className={className}
          >
              <code className="whitespace-pre">{codeContent}</code>
          </pre>
      );
      inCodeBlock = false;
      inMathBlock = false;
      currentCodeLines = [];
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmedLine = line.trim();
    
    // --- MATH BLOCK LOGIC (Handles LaTeX \[ \] delimiters) ---
    if (inMathBlock) {
        if (trimmedLine.endsWith("\\]")) {
            // End of math block
            // Remove ending delimiter before pushing the last line
            currentCodeLines.push(line.replace(/\\]$/, '').trim()); 
            finishCodeBlock(idx, true);
            continue; 
        }
        currentCodeLines.push(line);
        continue;
    } 
    
    if (trimmedLine.startsWith("\\[")) {
        // Start of math block
        finishList(idx);
        
        // Remove starting delimiter before pushing the first line
        currentCodeLines.push(line.replace(/^\\\[/, '').trim());
        inMathBlock = true;
        continue;
    }
    // --- END MATH BLOCK LOGIC ---

    // --- FENCED CODE BLOCK LOGIC (Handles ``` markers) ---
    if (inCodeBlock) {
        if (trimmedLine.startsWith("```")) {
            // End of code block
            finishCodeBlock(idx, false);
            continue; 
        }
        currentCodeLines.push(line);
        continue;
    } 
    
    if (trimmedLine.startsWith("```")) {
        // Start of code block
        finishList(idx);
        inCodeBlock = true;
        continue;
    }
    // --- END FENCED CODE BLOCK LOGIC ---
    
    // 1. Check for Headings and close list if open
    if (trimmedLine.startsWith("#")) {
      finishList(idx);

      // # Heading (H1 - Main Title)
      if (trimmedLine.startsWith("# ")) {
        blocks.push(
          <h1
            key={idx}
            className="text-xl font-bold mt-4 mb-2 text-gray-900 border-b-2 border-indigo-300 pb-2"
          >
            {trimmedLine.replace("# ", "")}
          </h1>
        );
        continue;
      }
      
      // ## Subheading (H2 - Section Title)
      if (trimmedLine.startsWith("## ")) {
        blocks.push(
          <h2
            key={idx}
            className="text-lg font-semibold mt-4 mb-2 text-indigo-700 border-b border-gray-200 pb-1"
          >
            {trimmedLine.replace("## ", "")}
          </h2>
        );
        continue;
      }
      
      // ### Small Heading (H3 - Subsection/Point Title)
      if (trimmedLine.startsWith("### ")) {
        blocks.push(
          <h3
            key={idx}
            className="text-md font-bold mt-3 mb-1 text-gray-800"
          >
            {trimmedLine.replace("### ", "")}
          </h3>
        );
        continue;
      }
    }


    // 2. Line Separator/Empty Line (also closes list)
    if (trimmedLine === "") {
        finishList(idx);
        blocks.push(<p key={idx} className="mb-2" />);
        continue;
    }

    // 3. Check for Numbered List Item
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.*)/);
    if (numberedMatch) {
      if (listType === 'bullet') finishList(idx);
      
      const content = applyBold(numberedMatch[2], idx);
      currentList.push(
        <li key={idx} className="leading-relaxed mb-1">
          {content}
        </li>
      );
      listType = 'numbered';
      continue;
    }

    // 4. Check for Bullet List Item
    const bulletMatch = trimmedLine.match(/^[\-\•]\s*(.*)/) || trimmedLine.match(/^•\s*(.*)/);
    if (bulletMatch) {
      if (listType === 'numbered') finishList(idx);

      const content = applyBold(bulletMatch[1], idx);
      currentList.push(
        <li key={idx} className="leading-relaxed mb-1 ml-4">
          {content}
        </li>
      );
      listType = 'bullet';
      continue;
    }
    
    // If we reach a non-list line, close any open list before treating as a paragraph
    if (listType) {
      finishList(idx);
    }
    
    // 5. General Paragraph
    const content = applyBold(line, idx);
    blocks.push(
        <p key={idx} className="text-gray-700 leading-relaxed mb-2">
            {content}
        </p>
    );
  }

  // Final check to close any open list or block
  finishList('final');
  if (inCodeBlock) finishCodeBlock('final', false);
  if (inMathBlock) finishCodeBlock('final', true); // Should close the math block if it reaches the end unexpectedly

  return <div className="flex flex-col gap-1">{blocks}</div>;
};

/* --------------------------- Helper: file -> base64 --------------------------- */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read error"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

/* --------------------------- Main Chat Component --------------------------- */
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState("ai");
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [selectedBot, setSelectedBot] = useState("hr");
  const [imagesBase64, setImagesBase64] = useState([]);
  const messagesEndRef = useRef(null);

  const theme = useTheme();


  const botDocuments = {
    hr: ["2492000000017183"],
    Vedanta: ["2492000000018094"],
    finance: ["2492000000017184"],
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectMode = (mode) => {
    if (mode === "rag") {
      setSelectedModel(null);
    } else {
      if (!selectedModel) setSelectedModel(AVAILABLE_MODELS[0]);
    }
    setSelectedMode(mode);
    setImagesBase64([]);
  };

  const handleImageFiles = async (files) => {
    if (!files || files.length === 0) {
      setImagesBase64([]);
      return;
    }
    try {
      const promises = Array.from(files).map((f) => fileToBase64(f));
      const results = await Promise.all(promises);
      const stripped = results.map((d) => {
        if (typeof d !== "string") return d;
        const idx = d.indexOf("base64,");
        return idx >= 0 ? d.substring(idx + 7) : d;
      });
      setImagesBase64(stripped);
    } catch (err) {
      console.error("Image conversion error", err);
      alert("Failed to read images. Try smaller files or different images.");
    }
  };

  const handleSend = async () => {
    if (!query.trim()) return alert("Please enter a prompt or question.");
    if (
      selectedMode === "ai" &&
      selectedModel?.key === "code" &&
      query.trim().length < 30
    ) {
      return alert(
        "Code snippet too short. Please provide a complete code sample (≥30 characters)."
      );
    }
    if (
      selectedMode === "ai" &&
      selectedModel?.key === "vision" &&
      imagesBase64.length === 0
    ) {
      return alert("Please upload at least one image for the vision model.");
    }

    // const userMessage = { role: "user", text: query };
    const userMessage = {
  role: "user",
  text: query,
  images: selectedModel?.key === "vision" ? imagesBase64 : [],
};

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setImagesBase64([]);      // ⭐ CLEAR IMAGES AFTER SENDING

    setLoading(true);

    try {
      let res;
      if (selectedMode === "ai") {
        const payload = {
          prompt: query,
          model_type: selectedModel.key,
          model: selectedModel.model,
        };
        if (selectedModel.key === "vision") payload.images = imagesBase64;

        res = await axios.post("/server/ai_service/api/llm/answer", payload);
      } else {
        res = await axios.post("/server/ai_service/api/rag/answer", {
          query,
          documents: botDocuments[selectedBot],
        });
      }

      const answer =
        res?.data?.answer ||
        res?.data?.response ||
        JSON.stringify(res?.data || {});
      
      const formattedAnswer = answer; 

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: formattedAnswer },
      ]);
    } catch (err) {
      console.error("API Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
<div className="flex flex-col min-h-[93vh]">
      {/* HEADER */}
  
  <header className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg border-b text-white sticky top-0 z-50">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
    {/* Left Section */}
    <div className="flex items-start sm:items-center gap-3">
      <div className="p-2 rounded-full bg-white/10 flex-shrink-0">
        <Bot className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-lg sm:text-xl font-semibold leading-tight">
          Talk to DSV AI
        </h1>
        <p className="text-sm opacity-90 leading-snug">
          Choose AI model or RAG bot — Qwen text, coder, or vision
        </p>
      </div>
    </div>

    {/* Right Section */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
      {/* Mode buttons */}
      <div className="flex items-center bg-white/10 rounded-full p-1 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
        <button
          onClick={() => selectMode("ai")}
          className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition w-1/2 sm:w-auto ${
            selectedMode === "ai"
              ? "bg-white text-indigo-700 shadow"
              : "text-white/90 hover:bg-white/20"
          }`}
        >
          <Brain className="w-4 h-4" />
          AI Model
        </button>
        <button
          onClick={() => selectMode("rag")}
          className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition w-1/2 sm:w-auto ${
            selectedMode === "rag"
              ? "bg-white text-green-700 shadow"
              : "text-white/90 hover:bg-white/20"
          }`}
        >
          <Bot className="w-4 h-4" />
          RAG Bot
        </button>
      </div>

      {/* Dropdowns */}
      {selectedMode === "ai" && (
        <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 shadow-sm w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Model:
          </label>
          <select
            value={selectedModel?.model || ""}
            onChange={(e) => {
              const sel = AVAILABLE_MODELS.find(
                (m) => m.model === e.target.value
              );
              setSelectedModel(sel || null);
            }}
            className="px-3 py-1 rounded-md text-sm border focus:outline-none text-indigo-700 w-full sm:w-auto"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.model} value={m.model}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMode === "rag" && (
        <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 shadow-sm w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Bot:
          </label>
          <select
            value={selectedBot}
            onChange={(e) => setSelectedBot(e.target.value)}
            className="px-3 py-1 rounded-md text-sm border focus:outline-none text-green-700 w-full sm:w-auto"
          >
            <option value="hr">HR Bot</option>
            <option value="Vedanta">Vedanta</option>
            <option value="finance">Finance Bot</option>
          </select>
        </div>
      )}
    </div>
  </div>
</header>

      {/* CHAT AREA */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
  {messages.map((msg, idx) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-md text-[15px] leading-relaxed break-words transition-all duration-300 ${
          msg.role === "user"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-200 hover:shadow-blue-300"
            : "border border-gray-100 rounded-bl-none hover:shadow-md"
        }`}
      >
        {/* Decorative accent */}
        {msg.role === "assistant" ? (
          <div className="absolute -left-2 top-3 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100" />
        ) : (
          <div className="absolute -right-2 top-3 w-3 h-3 bg-blue-600 rotate-45" />
        )}

        {/* Message content */}
        {/* {msg.role === "assistant"
          ? renderFormattedText(msg.text)
          : msg.text} */}

          {msg.images && msg.images.length > 0 && (
  <div className="flex gap-2 mb-2 flex-wrap">
    {msg.images.map((img, i) => (
      <img
        key={i}
        src={`data:image/*;base64,${img}`}
        className="w-24 h-24 object-cover rounded-lg border"
        alt="uploaded"
      />
    ))}
  </div>
)}

{msg.role === "assistant"
  ? renderFormattedText(msg.text)
  : msg.text}
      </div>
    </motion.div>
  ))}

  {/* Loading bubble */}
  {loading && (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 bg-white border px-4 py-2 rounded-2xl shadow-sm text-gray-600 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span>Thinking...</span>
      </div>
    </div>
  )}

  <div ref={messagesEndRef} />
</div>


      {/* INPUT SECTION */}
      <Box
      sx={{
      p: 2,
      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      position: "sticky",
      bottom: 0,
      zIndex: 10,
      backgroundColor: (theme) =>
        theme.palette.mode === "dark" ? "#121212" : "#fff",
    }}
    >
      {/* Input row */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ flex: 1, position: "relative" }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder={
              selectedMode === "ai"
                ? selectedModel?.key === "vision"
                  ? "Enter prompt for Vision model..."
                  : "Enter prompt for selected AI model..."
                : `Ask the ${selectedBot.toUpperCase()} bot...`
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "9999px",
               // color: "#f5f5f5",
               // backgroundColor: "rgba(255,255,255,0.05)",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "#3b82f6",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                },
              },
              "& .MuiInputBase-input::placeholder": {
              //  color: "rgba(255,255,255,0.5)",
              },
            }}
          />

          {/* Vision Upload Button */}
          {selectedMode === "ai" && selectedModel?.key === "vision" && (
            <IconButton
              component="label"
              size="small"
              sx={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "#3b82f6",
                color: "white",
                "&:hover": { bgcolor: "#2563eb" },
              }}
            >
              <Add fontSize="small" />
            <input
                hidden
                accept="image/*"
                multiple
                type="file"
                onChange={async (e) => {
                  await handleImageFiles(e.target.files);
                  e.target.value = null; 
                }}
              />
            </IconButton>
          )}
        </Box>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={loading}
          variant="contained"
          sx={{
            bgcolor: "#3b82f6",
            borderRadius: "9999px",
            px: 3,
            py: 1.2,
            textTransform: "none",
            fontWeight: 500,
            "&:hover": { bgcolor: "#2563eb" },
          }}
          endIcon={<Send />}
        >
          Send
        </Button>
      </Stack>

      {/* Image Previews */}
      {selectedMode === "ai" &&
        selectedModel?.key === "vision" &&
        imagesBase64.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
            {imagesBase64.map((img, i) => (
              <Box key={i} sx={{ position: "relative" }}>
                <Avatar
                  src={`data:image/*;base64,${img}`}
                  variant="rounded"
                  sx={{ width: 48, height: 48, border: "1px solid #444" }}
                />
                <IconButton
                  size="small"
                  onClick={() =>
                    setImagesBase64(imagesBase64.filter((_, idx) => idx !== i))
                  }
                  sx={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    bgcolor: "error.main",
                    color: "#fff",
                    "&:hover": { bgcolor: "error.dark" },
                    width: 18,
                    height: 18,
                  }}
                >
                  ×
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}
    </Box>
    </div>
  );
};

export default ChatInterface;
