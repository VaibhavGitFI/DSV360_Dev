"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const {
  USER_STATUS,
} = require("zcatalyst-sdk-node/lib/user-management/user-management");
app.use(fileUpload());
app.use(express.json()); // To handle text data if sent as JSON
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(cors());
require("dotenv").config();

const catalyst = require("zcatalyst-sdk-node");
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Catalyst app
app.use(async (req, res, next) => {
  const catalystApp = catalyst.initialize(req);
  req.catalystApp = catalystApp;
  next();
});


const credentials = {
  USERConnector: {
    client_id: "1000.MHJNQ4L3G2NIO4EBXKT86POD1WAI9J",
    client_secret: "4aa4cf841974ca7892568d8efdcdb369cc91693658",
    auth_url: "https://accounts.zoho.in/oauth/v2/token",
    refresh_url: "https://accounts.zoho.in/oauth/v2/token",
    refresh_token:
      "1000.16d614b05693f1cc2e9498c262fb31a5.fa67a063b9e98071b501726fef2d8edd",
  },
};

const env = process.env.CATALYST_USER_ENVIRONMENT;
console.log("Environment = ", env);

async function getZohoAccessToken(req) {
  const catalystApp = catalyst.initialize(req);
  const cache = catalystApp.cache().segment();

  let accessToken = await cache.get("USERConnector");
  // console.log("Token",accessToken);
  if (!accessToken.cache_value) {
    console.log("Access token not found in cache, generating a new one...");
    try {
      accessToken = await catalystApp
        .connection(credentials)
        .getConnector("USERConnector")
        .getAccessToken();

      if (accessToken) {
        await cache.put("USERConnector", accessToken, 1);
        console.log("New access token generated and cached.");
        return accessToken;
      }
    } catch (error) {
      console.error("Error generating Zoho access token:", error);
      return null;
    }
  } else {
    console.log("Using cached access token.");
  }

  return accessToken.cache_value;
}

const getAllUsers = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    let userPromise = await userManagement.getCurrentUser(); 
    const users = await userManagement.getAllUsers(userPromise.org_id);
    // console.log("user", users);
    const sortedUsers = users.sort((a, b) => {
      if (
        a.role_details.role_name === "Admin" &&
        b.role_details.role_name !== "Admin"
      ) {
        return -1;
      } else if (
        a.role_details.role_name !== "Admin" &&
        b.role_details.role_name === "Admin"
      ) {
        return 1;
      }
      return 0;
    });

    const placeholderURL =
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";

    const employeesWithPlaceholders = sortedUsers?.map((employee) => ({
      ...employee,
      profile_pic: placeholderURL,
    }));

    // Respond with the user data
    res.status(200).json({
      message: "Users fetched successfully",
      users: employeesWithPlaceholders,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const user_ID = req.params.user_ID;
  const reassignments = req.body; // Array of tasks that need reassignment

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Tasks");
    const zcql = catalystApp.zcql();

    // Fetch all active tasks
    const query = `SELECT * FROM Tasks WHERE Status != 'Completed'`;
    const tasks = await zcql.executeZCQLQuery(query);

    // Process each task that has the user assigned
    await Promise.all(
      tasks.map(async (task) => {
        const assignedIds = task.Tasks.Assign_To_ID.split(",").map((id) =>
          id.trim()
        );

        // Only process if user is actually assigned to this task
        if (assignedIds.includes(user_ID)) {
          const assignedNames = task.Tasks.Assign_To.split(",").map((name) =>
            name.trim()
          );

          // Check if this task needs reassignment (solo task)
          const reassignment = reassignments.find(
            (r) => r.Task_ID === task.Tasks.ROWID
          );

          if (reassignment) {
            // This is a solo task, replace with new assignee
            await table.updateRow({
              ROWID: task.Tasks.ROWID,
              Assign_To: reassignment.assigned_To,
              Assign_To_ID: reassignment.assigned_To_Id,
            });
          } else {
            // This is a group task, just remove the user
            const userIndex = assignedIds.indexOf(user_ID);
            assignedIds.splice(userIndex, 1);
            assignedNames.splice(userIndex, 1);

            await table.updateRow({
              ROWID: task.Tasks.ROWID,
              Assign_To: assignedNames.join(", "),
              Assign_To_ID: assignedIds.join(", "),
            });
          }
        }
      })
    );

    // Delete the user after all tasks are updated
    let userManagement = catalystApp.userManagement();
    const response = await userManagement.deleteUser(user_ID);

    res.status(200).json({
      success: true,
      message: "User and task assignments updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error processing user deletion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process user deletion",
      error: error.message,
    });
  }
};

const updateUserStatus = async (req, res) => {
  const user_ID = req.params.user_ID;
  const active = req.params.active !== "ACTIVE";

  // console.log("id at backend", user_ID, active);

  if (!user_ID || typeof active !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Invalid parameters",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    let userManagement = catalystApp.userManagement();

    const response = await userManagement.updateUserStatus(
      user_ID,
      active ? "enable" : "disable"
    );

    // console.log("response", response);

    res.status(200).json({
      success: true,
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

const addUser = async (req, res) => {
  const data = req.body;
  if (!data.first_name || !data.email_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }


  try {
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    const currUser = await userManagement.getCurrentUser();

    if(!currUser || !currUser.org_id){
      res.send(500).json({
        message:"Internal Server Error",
        error:"Admin orgID not found"
      })
    }

    const signupConfig = {
      platform_type: "web",
      template_details: {
        senders_mail: "catalystadmin@dsv360.ai",
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
      redirect_url: env === "Production" ? 'https://project.dsv360.ai' : 'https://project-management-60040289923.development.catalystserverless.in',
    };

    const userConfig = {
      first_name: data.first_name,
      last_name: data?.last_name ?? "",
      email_id: data.email_id,
      org_id: currUser.org_id,
      role_id: data.role_id,
    };

    
    const addedUser = await userManagement.addUserToOrg(
      signupConfig,
      userConfig
    );

    if (
      !addedUser ||
      !addedUser.user_details ||
      !addedUser.user_details.user_id
    ) {
      throw new Error("Failed to retrieve user ID after adding.");
    }

    const newUserID = addedUser.user_details.user_id;
    const userName = `${data.first_name} ${data.last_name}`;
    const defaultResume = "123";

    const a = "";

    const datastore = catalystApp.datastore();
    const userTable = datastore.table('Users');
    const userData = {
        Address: "Add Your Address",
        AboutME: "Tell About You",
        RoleID: data.role_id,
        OrgID: currUser.org_id,
        Username: userName,
        Skills: "Add Your Skills",
        User_Id: newUserID,
        CountryCode: "+91"
    };

    await userTable.insertRow(userData);

    res.status(200).json({
      message: "User added successfully",
      data: addedUser,
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({
      success:"false",
      message: error.message,
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  try {
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    const updatedUser = await userManagement.updateUserDetails(userId, data);
    const fullName = `${data.first_name} ${data.last_name}`;

    const query = `UPDATE Users SET Username='${fullName}' WHERE User_Id=${userId}`;
    const updateResponse = await catalystApp.zcql().executeZCQLQuery(query);

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

const getUserTasks = async (req, res) => {
  const userId = req.params.User_Id;
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const datastore = catalystApp.datastore();

    const query = `SELECT * FROM Tasks WHERE Assign_To_ID = ${userId} and Status != 'Completed'`;
    const queryResp = await zcql.executeZCQLQuery(query);

    res.status(200).json({
      success: true,
      data: queryResp,
    });
  } catch (error) {
    //console.log(error);
  }
};
const getUserProfile = async (req, res) => {
  const userId = req.params.User_Id;
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Fetch all tasks
    const query = `SELECT * FROM Tasks`;
    const queryResp = await zcql.executeZCQLQuery(query);

    // Filter tasks where Assign_To_ID contains this userId
    const filteredTasks = queryResp.filter((task) => {
      const assignedIds = task.Tasks.Assign_To_ID.split(",").map((id) =>
        id.trim()
      );
      return assignedIds.includes(userId.toString()); // Check if userId is present
    });

    res.status(200).json({
      success: true,
      data: filteredTasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const getUnassignedEmployees = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;

    const assigned_To_Id = await catalystApp
      .zcql()
      .executeZCQLQuery(
        "SELECT Assign_To_ID FROM Tasks WHERE Status!= 'Completed'"
      );

    const formattedAssignedIds = [
      ...new Set(
        assigned_To_Id
          .map((task) =>
            task.Tasks.Assign_To_ID.split(",").map((id) => id.trim())
          )
          .flat()
          .filter((id) => id !== "")
      ),
    ];

    // console.log(formattedAssignedIds);

    const userManagement = catalystApp.userManagement();
    const users = await userManagement.getAllUsers();

    const unassignedUsers = users.filter((user) => {
      return (
        user.user_id &&
        !formattedAssignedIds.includes(String(user.user_id)) &&
        user.role_details.role_name !== "Contacts" &&
        user.role_details.role_name !== "Admin"
      );
    });

    res.status(200).json({
      success: true,
      data: unassignedUsers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const reInvitedEmployee = async (req, res) => {
  const { first_name, last_name, email_id, user_id, role_id } = req.body;
  const catalystApp=req.catalystApp
  const cache = catalystApp.cache().segment();

  try {

    const accessToken = await getZohoAccessToken(req);
    if (!accessToken){
      res.send(500).json({
        success:"false",
        message :"Error in getting accesds token"
      })
    };

    console.log("dsfd",accessToken);

    const reinviteData = {
      platform_type: "web",
      redirect_url:
        env === "Production"
          ? "https://project.dsv360.ai/"
          : "https://project-management-60040289923.development.catalystserverless.in",
      user_details: {
        email_id: email_id,
        first_name: first_name,
        last_name: last_name,
      },
      template_details: {
        senders_mail: "catalystadmin@dsv360.ai",
        subject: "Reminder: Complete Your DSV 360 Registration",
        message: `<html>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333333;">
    <div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px;">

      <!-- Logo -->
      <img alt="DSV360 Logo" width="90" height="70" src="https://fristinetech.com/wp-content/uploads/2023/11/Google-Ads-Logo.png" style="max-width: 100px; margin-bottom: 20px;">

      <!-- Heading -->
      <h2 style="color: #333333; font-size: 24px; margin-bottom: 10px; font-weight: 600;">
        Hello, ${first_name} ${last_name}
      </h2>

      <!-- Subheading -->
      <h3 style="color: #007BFF; font-size: 18px; margin-bottom: 20px; font-weight: normal;">
        Reminder: Complete Your <span style="font-weight: bold;">DSV360 Portal</span> Registration
      </h3>

      <!-- Reminder Message -->
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        We noticed that you haven't completed your registration for the <strong>DSV360 Portal</strong> yet.
      </p>
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        To activate your account and access the portal features, please click the button below:
      </p>

      <!-- CTA Button -->
      <a href="%LINK%"
        style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: bold; margin: 20px 0; transition: background-color 0.3s ease;">
        Complete Registration
      </a>

      <!-- Already Registered -->
      <p style="font-size: 14px; color: #666666; margin-top: 20px;">
        Already registered? <a href="https://portal.dsv360.com/" style="color: #007BFF; text-decoration: none; font-weight: bold;">Log in here</a>.
      </p>

      <!-- Signature -->
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
</html>`,
      },
    };

    const response = await axios.post(
      "https://api.catalyst.zoho.in/baas/v1/project/17682000000037195/project-user/re-invite",
      reinviteData,
      {
        headers: {
          "catalyst-org": "60040289923",
          "content-type": "application/json",
          environment: env === "Production" ? "Production" : "Development",
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );

    res.status(200).json({
      message: "User reinvited successfully",
      data: { success: true, response: response.data },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      error: error,
    });
  }
};

const setReporterToUser=async(req,res)=>{
    const {user_id,reporter_id,reporter_name,reporter_image}=req.body;

    if(!reporter_id || !reporter_name){
      return res.status(400).json({
        success:false,
        message:"Reporter id and reporter name is required"
      })
    }

    try{
      const catalystApp=req.catalystApp;
      const query=`SELECT ROWID FROM Users WHERE user_id=${user_id}`;
      const userResponse=await catalystApp.zcql().executeZCQLQuery(query);



      if(!userResponse || userResponse.length===0 || !userResponse[0].Users || !userResponse[0].Users.ROWID){
        return res.status(404).json({
          success:false,
          message: "User not found"
        })
      }

    const userRowId=userResponse[0].Users.ROWID;
    const usertable=catalystApp.datastore().table("Users");
    const userUpdateResponse=await usertable.updateRow({
      ROWID:userRowId,
      ReporterID:reporter_id,
      ReporterName:reporter_name,
      ReporterImage:reporter_image  
    });

    res.status(200).json({
      success:true,
      message:"Reporter set successfully",
      data:userUpdateResponse
    })

    }catch(err){
      res.status(500).json({
        success:false,
        message:"Unexpected error occurred",
        error:err
      })
    }



}





module.exports = {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  addUser,
  updateUser,
  getUserTasks,
  getUserProfile,
  getUnassignedEmployees,
  reInvitedEmployee,
  setReporterToUser
};
