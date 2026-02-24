"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
require("dotenv").config();

const catalyst = require("zcatalyst-sdk-node");
const { container } = require("webpack");
const { findPackageJSON } = require("module");
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const {
  USER_STATUS,
} = require("zcatalyst-sdk-node/lib/user-management/user-management");

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

const env = process.env.CATALYST_USER_ENVIRONMENT;
console.log("Environment = ", env);


const contactDashBoard = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Client ID is required",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();

    const projectQuery = `SELECT * FROM Client_Contact WHERE OrgID = ${id}`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);
    const formattedResponse = response.map(
      (contact) => contact?.Client_Contact
    );
    const orgQuery = `SELECT * FROM Client_Org WHERE ROWID = ${id}`;
    const orgResponse = await catalystApp.zcql().executeZCQLQuery(orgQuery);
    const formattedOrgResponse = orgResponse.map(
      (contact) => contact?.Client_Org
    );
    const orgName = formattedOrgResponse[0]?.Org_Name;
    const orgId = formattedOrgResponse[0]?.ROWID;
    const orgContact = formattedResponse.map((contact) => ({
      ...contact,
      Org_Name: orgName,
      OrgID: orgId,
    }));
    res.status(200).json({
      success: true,
      data: orgContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client contacts",
      error: error.message,
    });
  }
};

const getClientData = async (req, res) => {
  try {
    const id = req.params.userID;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }
    const catalystApp = req.catalystApp;
    const query = `SELECT * FROM Client_Contact WHERE UserID = ${id}`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);

    response.sort((a, b) => {
      return new Date(b.CREATEDTIME) - new Date(a.CREATEDTIME);
    });

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client data",
      error: error.message,
    });
  }
};
const getClientOrg = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Org");
    const response = await table.getAllRows();
    
    response.sort((a, b) => {
      return new Date(b.CREATEDTIME) - new Date(a.CREATEDTIME);
    });
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client organizations",
      error: error.message,
    });
  }
};

const getOrgContact = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }
    const catalystApp = req.catalystApp;

    const query = `SELECT * FROM Client_Contact WHERE OrgID = ${id}`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);

    const formattedResponse = response.map(
      (contact) => contact?.Client_Contact
    );

    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client contacts",
      error: error.message,
    });
  }
};
const getContact = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Contact");
    const response = await table.getAllRows();

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client contacts",
      error: error.message,
    });
  }
};
const createClient = async (req, res) => {
  try {
    const clientData = req.body;
    if (!clientData) {
      return res.status(400).json({
        success: false,
        message: "Client data is required",
      });
    }

    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Org");
    const record = await table.insertRow(clientData);

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create client",
      error: error.message,
    });
  }
};
const updateClient = async (req, res) => {
  try {
    const clientData = req.body;
    const id = req.params.ROWID;

    if (!clientData || !id) {
      return res.status(400).json({
        success: false,
        message: "Client data and ID are required",
      });
    }

    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Org");
    const record = await table.updateRow({ ROWID: id, ...clientData });

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update client",
      error: error.message,
    });
  }
};
const addContact = async (req, res) => {
  const { first_name, last_name, email_id, org_name, org_id, phone } = req.body;

  // Validate required fields
  if (!first_name  || !email_id) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  try {
    // Configuration for the welcome email
    const signupConfig = {
      platform_type: "web",
      template_details: {
        senders_mail:  "catalystadmin@dsv360.ai",
        subject: "Welcome to DSV Organization",
        message: `<html>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333333;">
    <div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px;">

      <!-- Logo -->
      <img alt="DSV360 Logo" width="90" height="70" src="https://fristinetech.com/wp-content/uploads/2023/11/Google-Ads-Logo.png" style="max-width: 100px; margin-bottom: 20px;">

      <!-- Heading -->
      <h2 style="color: #333333; font-size: 24px; margin-bottom: 10px; font-weight: 600;">
        Dear ${first_name+ " "+ last_name}
      </h2>

      <!-- Subheading -->
      <h3 style="color: #333333; font-size: 18px; margin-bottom: 20px; font-weight: normal;">
        Welcome to <span style="color: #007BFF; font-weight: bold;">DSV</span>
      </h3>

      <!-- Invitation Message -->
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        We're excited to have you on board! As a valued client, you now have exclusive access to the DSV Portal where you can manage your services, track progress, and collaborate with our team.
      </p>

      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        Click the button below to set up your account and start exploring your personalized dashboard.
      </p>

      <!-- Button -->
      <a href="%LINK%"
        style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: bold; margin: 20px 0; transition: background-color 0.3s ease;">
        Join DSV Now
      </a>

      <!-- Optional Disclaimer -->
      <p style="font-size: 14px; color: #666666; margin-top: 20px;">
        If you believe this invitation was sent to you in error, feel free to disregard this message.
      </p>

      <p style="font-size: 14px; color: #666666;">
        We look forward to a great partnership. <br>
        Sincerely, <br>
        The <strong>DSV</strong> Team
      </p>

      <!-- Divider -->
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #dddddd;">

      <!-- Footer -->
      <p style="font-size: 12px; color: #888888; text-align: left;">
        © 2025 DSV. All rights reserved.
      </p>
    </div>
  </body>
</html>
`,
      },
      redirect_url: env === "Production" ? 'https://project.dsv360.ai' : 'https://project-management-60040289923.development.catalystserverless.in',

    };

    // User configuration
    const userConfig = {
      first_name: first_name,
      last_name: last_name ?? "",
      email_id: email_id,
      org_id: env === "Production" ? 50027580589 : 50026358236,
      role_id: "17682000000035363",
    };

    // Add user to the system
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    const addedUser = await userManagement.addUserToOrg(
      signupConfig,
      userConfig
    );

    // Check if the user was successfully added
    if (
      !addedUser ||
      !addedUser.user_details ||
      !addedUser.user_details.user_id
    ) {
      throw new Error("Failed to retrieve user ID after adding.");
    }

    const newUserID = addedUser.user_details.user_id;
    console.log("New User ID:", newUserID);
    console.log("Added User Details:", {
      First_Name: first_name,
      Last_Name: last_name,
      Org_Name: org_name,
      OrgID: org_id,
      Email: email_id,
      UserID: newUserID,
    });

    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Contact");
    const response = await table.insertRow({
      First_Name: first_name,
      Last_Name: last_name,
      Org_Name: org_name,
      OrgID: org_id,
      Email: email_id,
      UserID: newUserID,
      Phone: phone,
    });

    // Respond with success message
    res.status(200).json({
      message: "User added successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error adding user:", error);

    // Respond with a proper error message
    res.status(500).json({
      message: "Failed to add user",
      error: error.message || error.toString(),
    });
  }
};

const getClientProjects = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const catalystApp = req.catalystApp;
    const query = `SELECT * FROM Projects WHERE Client_ID = ${id}`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client projects",
      error: error.message,
    });
  }
};

const getClientTasks = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const catalystApp = req.catalystApp;
    const query = `SELECT * FROM Projects WHERE Client_ID= ${id}`;
    const ProjectResponse = await catalystApp.zcql().executeZCQLQuery(query);

    const projectIds = ProjectResponse.map((project) => project.Projects.ROWID);

    const taskResponse = await Promise.all(
      projectIds.map(async (projectId) => {
        const taskQuery = `SELECT * FROM Tasks WHERE ProjectID =  '${projectId}'`;
        return await catalystApp.zcql().executeZCQLQuery(taskQuery);
      })
    );

    const flattenedTasks = taskResponse.flat();
    const formattedResponse = flattenedTasks.map((task) => task.Tasks);

    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client tasks",
      error: error.message,
    });
  }
};

const deleteORG = async (req, res) => {
  const id = req.params.id;
  console.log("id",id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ORG ID is required",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();

    const query = `SELECT * FROM Client_Contact WHERE OrgID = ${id}`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);
    console.log("response",response.length);
    if (response.length > 0) {
      return res.status(200).json({
        success: false,
        data: response,
        message: "Cannot delete org with existing contacts",
      });
    }

    const table = datastore.table("Client_Org");
    await table.deleteRow(id);

    res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message,
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const ROWID = req.body.ROWID;
    const USERID = req.body.USERID;

    console.log("Deleting client with ID:", ROWID);
    console.log("Deleting user with ID:", USERID);

    if (!ROWID || !USERID) {
      return res.status(400).json({
        success: false,
        message: "Client ID and User ID are required",
      });
    }

    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    await userManagement.deleteUser(USERID);

    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Contact");
    await table.deleteRow(ROWID);

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message,
    });
  }
};


const updateClientContactStatus = async (req, res) => {
  try {
    const { status,ROWID,USERID } = req.body;  // Extract status from the request body
    console.log("Updating client contact status with ID:", status,ROWID,USERID);
    if (!ROWID || !USERID || status === undefined) {
      return res.status(400).json({
        success: false,
        message: "User ID , ROWID and status are required",
      });
    }
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();

    const response = await userManagement.updateUserStatus(
      USERID,
      status ? "enable" : "disable"
    );  

    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Contact"); 


    // Update the status of the client contact
    const updatedRow = await table.updateRow({
      ROWID,
      ...{status}, // If status is true, set it to 'true' (active); if false, set it to 'false' (inactive)
    });

    // Check if the record was updated
    if (updatedRow) {
      return res.status(200).json({
        success: true,
        message: "Client contact status updated successfully",
        data: updatedRow,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Client contact not found",
      });
    }
  } catch (error) {
    console.error("Error updating client contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update client contact",
      error: error.message,
    });
  }
};










module.exports = {
  getClientData,
  getContact,
  addContact,
  getOrgContact,
  createClient,
  updateClient,
  getClientOrg,
  getClientProjects,
  getClientTasks,
  deleteClient,
  deleteORG,
  updateClientContactStatus,
};
