"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const os = require("os");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const catalyst = require("zcatalyst-sdk-node");
const { error, log } = require("console");

app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const env = process.env.CATALYST_USER_ENVIRONMENT;



const addOrgAdmin = async (req, res) => {
  try {
    const {
      admin_email,
      admin_first_name,
      admin_last_name,
      org_name,
      org_color,
      org_id,
      org_is_new,
    } = JSON.parse(req.body.data);

    console.log("Received Data:", org_id);

    const file = req.files?.logo;

    if (org_is_new && !file) {
      return res.status(400).json({
        success: false,
        message: "Company Logo missing",
      });
    }

    const catalystApp = req.catalystApp;
    let org_logo = null;

    if (file) {
      const stratus = catalystApp.stratus();
      const bucket = stratus.bucket("dsv365");

      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${file.name}`;
      const uploadPath = `dsv365/company_logo/${uniqueFileName}`;
      const tempFilePath = path.join(os.tmpdir(), uniqueFileName);

      // Move file temporarily
      await file.mv(tempFilePath);

      // Upload to Stratus
      await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));

      // Get file details
      const uploadedObject = bucket.object(uploadPath);
      const objectDetails = await uploadedObject.getDetails();
      org_logo = objectDetails.object_url;

      // Remove temporary file
      fs.unlinkSync(tempFilePath);
    }

    // ✅ Dynamic redirect based on environment
    const env = process.env.CATALYST_ENV || "Development";

   const signupConfig = {
      platform_type: "web",
      template_details: {
        // senders_mail: "catalystadmin@dsv360.ai",
        subject: "Welcome to DSV360 Portal",
        message: `<html>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333333;">
    <div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; ">

      <!-- Logo -->
      <img alt="DSV360 Logo" width="90" height="70" src="https://fristinetech.com/wp-content/uploads/2023/11/Google-Ads-Logo.png" style="max-width: 100px; margin-bottom: 20px;">

      <!-- Heading -->
      <h2 style="color: #333333; font-size: 24px; margin-bottom: 10px; font-weight: 600;">
        Hello, %FIRST_NAME% %LAST_NAME%
      </h2>

      <!-- Subheading -->
      <h3 style="color: #333333; font-size: 18px; margin-bottom: 20px; font-weight: normal;">
        You're invited to join the <span style="color: #007BFF; font-weight: bold;">DSV360 Portal</span>
      </h3>

      <!-- Invitation Message -->
    
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        To get started, please click the button below to access the application.
      </p>

      <!-- Button -->
      <a href="%LINK%"
        style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: bold; margin: 20px 0; transition: background-color 0.3s ease;">
        Access DSV360
      </a>

      <!-- Optional Disclaimer -->
      <p style="font-size: 14px; color: #666666; margin-top: 20px;">
        If you didn’t request to join or believe this invitation was sent by mistake, you may safely ignore this email.
      </p>

      <p style="font-size: 14px; color: #666666;">
        Best regards, <br>
        The <strong>DSV360</strong> Team
      </p>

      <!-- Divider -->
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #dddddd;">

      <!-- Footer -->
      <p style="font-size: 12px; color: #888888; text-align: left;">
        © 2025 DSV360. All rights reserved.
      </p>
    </div>
  </body>
</html>
`,
      },
      redirect_url:
        env === "Production"
          ? "https://project.dsv360.ai"
          : "https://project-management-60040289923.development.catalystserverless.in",
    };
    const userConfig = {
      first_name: admin_first_name,
      last_name: admin_last_name,
      email_id: admin_email,
      org_id: org_id || "",
      role_id: "17682000000035329",
    };

    const userManagement = catalystApp.userManagement();
    let addedUser = await userManagement.addUserToOrg(signupConfig, userConfig);

    if (
      !addedUser ||
      !addedUser.user_details ||
      !addedUser.user_details.org_id
    ) {
      throw new Error("Failed to retrieve organization ID after adding user.");
    }

    const newOrgID = addedUser.user_details.org_id;
    const newUserID = addedUser.user_details.user_id;

    // ✅ If org is new, insert org details
    if (org_is_new) {
      const table = catalystApp.datastore().table("Org_Table");
      const orgDATA = {
        Org_Name: org_name,
        OrgID: newOrgID,
        Org_Logo: org_logo,
        Org_Theme: org_color,
      };
      addedUser=await table.insertRow(orgDATA);
    }

    const datastore = catalystApp.datastore();
    const userTable = datastore.table('Users');
    const userData = {
        RoleID: "17682000000035329",
        OrgID: newOrgID,
        Username: admin_first_name + " "+admin_last_name,
        User_Id: newUserID,
    };
    await userTable.insertRow(userData);


    return res.status(200).json({
      success: true,
      message: "Admin added successfully",
      data: addedUser,
    });

  } catch (error) {
    console.error("❌ Error adding user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add user",
      error: error.message,
    });
  }
};


const getAllAdmin = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    const users = await userManagement.getAllUsers();

    const filterUser = users.filter(
      (user) => user.role_details.role_name === "Admin"
    );

    res.status(200).json({
      success: true,
      users: filterUser,
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      error: err,
    });
  }
};

const getOrgAdmin=async(req,res)=>{

  const orgID= req.params.orgID;

  if(!orgID){
    res.status(400).json({
      "success":false,
      "message":"OrgId not found"
    })
  }

  try {
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    const users = await userManagement.getAllUsers(orgID);

    const filterUser = users.filter(
      (user) => user.role_details.role_name === "Admin"
    );

    res.status(200).json({
      success: true,
      users: filterUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
}

const updateAdminStatus = async (req, res) => {
  const { userID, status } = req.body;

  // Validate input
  if (!userID || (status !== "ACTIVE" && status !== "INACTIVE")) {
    return res.status(400).json({
      success: false,
      message: "Invalid parameters: 'userID' and 'status' (ACTIVE or INACTIVE) are required",
    });
  }

  // Determine action based on status
  const shouldEnable = status === "INACTIVE"; // INACTIVE => enable, ACTIVE => disable

  try {
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();

    const response = await userManagement.updateUserStatus(
      userID,
      shouldEnable ? "enable" : "disable"
    );

    res.status(200).json({
      success: true,
      message: `User has been ${shouldEnable ? "enabled" : "disabled"} successfully`,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

const deleteAdmin = async (req, res) => {
  const { userID, isDeleteOrg, orgID } = req.body;

  // Strong validation
  if (!userID || typeof isDeleteOrg !== "string" || (isDeleteOrg !== "true" && isDeleteOrg !== "false")) {
    return res.status(400).json({
      success: false,
      message: "Invalid parameters: userID or isDeleteOrg is missing or incorrect",
    });
  }

  if (isDeleteOrg === "true" && !orgID) {
    return res.status(400).json({
      success: false,
      message: "orgID is required when isDeleteOrg is true",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();

    // Ensure user exists before deleting (optional)
    const users = await userManagement.getAllUsers();
    const userExists = users.some(user => user.user_id === userID);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user
    await userManagement.deleteUser(userID);

    // Delete Org if flag is true
    if (isDeleteOrg === "true") {
      const deleteQuery = `DELETE FROM Org_Table WHERE OrgID = '${orgID}'`;
      await catalystApp.zcql().executeZCQLQuery(deleteQuery);
    }

    res.status(200).json({
      success: true,
      message: isDeleteOrg === "true"
        ? "Admin and Organization deleted successfully"
        : "Admin deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting admin",
      error: err.message,
    });
  }
};


const getAllOrg=async(req,res)=>{
  try{
    const catalystApp=req.catalystApp;
    const table=catalystApp.datastore().table("Org_Table");
    const response=await table.getAllRows();

    res.status(200).json({
      success:true,
      message:"All Org Fetched Successfully",
      data:response
    })
  }catch(err){
    res.status(500).json({
      success:false,
      error:err.message
    })
  }
}

const getAdminById = async (req, res) => {
  try {
    const orgId = req.params.id; // assuming your route is /admin/:id
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `SELECT * FROM Org_Table WHERE OrgID = ${orgId}`;
    const result = await zcql.executeZCQLQuery(query);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const orgDetails = result[0].Org_Table;

    res.status(200).json({
      success: true,
      organization: orgDetails,
    });
  } catch (err) {
    console.error("Error fetching organization:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server Error",
    });
  }
};

const updateOrg = async (req, res) => {
  try {
    const id = req.params.id;
    const catalystApp = req.catalystApp;
    let data = req.body;

    const query = `SELECT ROWID FROM Org_Table WHERE OrgID='${id}'`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);

    if (!response || response.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No organization found with OrgID: ${id}`,
      });
    }

    if (req.files && req.files.orgImg) {
      const file = req.files.orgImg;
      const stratus = catalystApp.stratus();
      const bucket = stratus.bucket("dsv365");
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${id}`;
      const uploadPath = `dsv365/company_logo/${uniqueFileName}`;
      const tempFilePath = path.join(os.tmpdir(), file.name);
      await file.mv(tempFilePath);
      await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));
      const uploadedObject = bucket.object(uploadPath);
      const objectDetails = await uploadedObject.getDetails();
      const orgURL = objectDetails.object_url;
      console.log("File successfully uploaded to Catalyst Stratus:", orgURL);
      data = {
        Org_Logo: orgURL,
      };
    }

    const ROWID = response[0].Org_Table.ROWID;
    const orgTable = catalystApp.datastore().table("Org_Table");

    const updateData = await orgTable.updateRow({
      ROWID,
      ...data,
    });

    return res.status(200).json({
      success: true,
      message: "Organization data updated successfully",
      data: updateData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Server Error",
    });
  }
};

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

module.exports = { addOrgAdmin, getAllAdmin,getOrgAdmin, getAdminById, updateOrg,getAllOrg ,updateAdminStatus,deleteAdmin};
