"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(fileUpload());
app.use(express.json()); // To handle text data if sent as JSON
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(cors());
const fs = require("fs");
const os = require("os");

const catalyst = require("zcatalyst-sdk-node");
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

const getResume = async (req, res) => {
  try {
    const user_ID = req.params.user_ID;
    const catalystApp = req.catalystApp;

    const query = `SELECT Resume_Link FROM Users WHERE User_Id = '${user_ID}'`;
    const resumeData = await catalystApp.zcql().executeZCQLQuery(query);

    const resumeLink = resumeData[0]?.Users?.Resume_Link;

    console.log("Resume link:", resumeLink);
    res.status(200).json({ success: true, data: resumeLink });
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateResume = async (req, res) => {
  try {
    const user_ID = req.params.user_ID;
    const catalystApp = req.catalystApp;

    if (!req.files || !req.files.resume) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    console.log("resume", req.files.resume);
    const file = req.files.resume;
    const stratus = catalystApp.stratus();
    const bucket = stratus.bucket("dsv365");
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_filename${file.name}`;
    const uploadPath = "dsv365/resume" + `/${uniqueFileName}`;
    const tempFilePath = path.join(os.tmpdir(), file.name);
    await file.mv(tempFilePath);

    const response = await bucket.putObject(
      uploadPath,
      fs.createReadStream(tempFilePath)
    );

    // Get file details from storage
    const objectIns = bucket.object(uploadPath);
    const objectRes = await objectIns.getDetails();

    console.log(`File uploaded to Catalyst Stratus. `, objectRes.object_url);

    const query = `UPDATE Users SET Resume_Link = '${objectRes.object_url}' WHERE User_Id = ${user_ID}`;
    const zcql = catalystApp.zcql();
    const queryResp = await zcql.executeZCQLQuery(query);
    fs.unlinkSync(tempFilePath);

    res.status(200).json({
      success: true,
      message: "Resume updated successfully.",
      resume_id: objectRes,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// const updateResume = async (req, res) => {
//   try {
//     const user_ID = req.params.user_ID;
//     const catalystApp = req.catalystApp;

//     if (!req.files || !req.files.resume) {
//       return res.status(400).json({ success: false, message: "No file uploaded." });
//     }

//     const file = req.files.resume;
//     const stratus = catalystApp.stratus();
//     const bucket = stratus.bucket("dsv365");
//     const timestamp = Date.now();
//     const uniqueFileName = `${timestamp}_filename${file.name}`;
//     const uploadPath = `dsv365/resume/${uniqueFileName}`;
//     const tempFilePath = path.join(os.tmpdir(), file.name);

//     // Save the uploaded file temporarily
//     await file.mv(tempFilePath);

//     // Upload to Stratus
//     const response = await bucket.putObject(
//       uploadPath,
//       fs.createReadStream(tempFilePath)
//     );

//     const objectIns = bucket.object(uploadPath);
//     const objectRes = await objectIns.getDetails();
//     console.log(`File uploaded to Catalyst Stratus. `, objectRes.object_url);

//     // OCR: Extract text from the resume
//     const zia = catalystApp.zia();
//     const ocrResult = await zia.extractOpticalCharacters(
//       fs.createReadStream(tempFilePath),
//       { modelType: "OCR", language: "eng" }
//     );

//     console.log("ocrResult: ", ocrResult);

//     // Normalize and extract text
//     const extractedText = ocrResult.text || '';
// // Normalize text
// const normalizedText = extractedText.replace(/\r\n|\r/g, '\n');
// const lines = normalizedText.split('\n').map(line => line.trim()).filter(line => line !== '');

// // Define headers
// const skillSectionHeaders = [
//   'Skills',
//   'Technical Skills',
//   'Technologies',
//   'Core Competencies',
//   'Expertise',
//   'Skills & Competencies'
// ];

// const skillSectionEnders = [
//   'Projects',
//   'Education',
//   'Experience',
//   'Achievements',
//   'Coding Profiles'
// ];

// let skillEntries = [];
// let inSkillsSection = false;

// for (let line of lines) {
//   if (!inSkillsSection && skillSectionHeaders.some(header => line.toLowerCase().includes(header.toLowerCase()))) {
//     inSkillsSection = true;
//     continue;
//   }

//   if (inSkillsSection && skillSectionEnders.some(ender => line.toLowerCase().includes(ender.toLowerCase()))) {
//     break;
//   }

//   if (inSkillsSection) {
//     // Remove labels like "Languages:", "Technologies:", etc.
//     const cleanedLine = line.replace(/^[A-Za-z\s&]+:/, '').trim();

//     // Split by comma and trim each skill
//     const skills = cleanedLine.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
//     skillEntries.push(...skills);
//   }
// }

// const skillsContent = skillEntries.length > 0
//   ? skillEntries.join(', ')
//   : 'No specific skills section found';

//     console.log("skillsSection:",skillsContent);
//     // Update Resume Link in DB
//     const zcql = catalystApp.zcql();
//     const query = `UPDATE Users SET Resume_Link = '${objectRes.object_url}' WHERE User_Id = ${user_ID}`;
//     await zcql.executeZCQLQuery(query);

//     // Delete the temp file
//     fs.unlinkSync(tempFilePath);

//     // Respond with success
//     res.status(200).json({
//       success: true,
//       message: "Resume updated and OCR processed successfully.",
//       resume_url: objectRes.object_url,
//       skills_section: skillsContent,
//     });
//   } catch (error) {
//     console.error("Error uploading and processing resume:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error.",
//     });
//   }
// };



module.exports = {
  getResume,
  updateResume,
};
