const catalyst = require("zcatalyst-sdk-node");
const axios = require("axios");

const credentials = {
  USERConnector: {
    client_id: "1000.MHJNQ4L3G2NIO4EBXKT86POD1WAI9J",
    client_secret: "4aa4cf841974ca7892568d8efdcdb369cc91693658",
    auth_url: "https://accounts.zoho.in/oauth/v2/token",
    refresh_url: "https://accounts.zoho.in/oauth/v2/token",
    refresh_token:
      "1000.7d645a8845efdc51f55503c871319b68.0196ee8c52f494186855ac21b48dfa78",
  },
};

module.exports = async (event, context) => {
  const catalystApp = catalyst.initialize(context);
  const emailService = catalystApp.email();
  const cache = catalystApp.cache().segment();
  const jobScheduling = catalystApp.jobScheduling();
  const datastore = catalystApp.datastore();
  const mailAnalyticsTable = datastore.table("Mail_Analytics");

  const page = Number(event.getJobParam("page")) || 1;
  const start = (page - 1) * 100;

  let accessToken;
  try {
    accessToken = await cache.get("USERConnector");
    if (!accessToken.cache_value) {
      console.log("Generating new access token...");
      token = await catalystApp
        .connection(credentials)
        .getConnector("USERConnector")
        .getAccessToken();

      accessToken = { access_token: token };
      await cache.put("USERConnector", token, 1);
    } else {
      accessToken = { access_token: accessToken.cache_value };
    }
  } catch (error) {
    console.error("❌ Access token error:", error);
    return context.closeWithFailure();
  }

  try {
    const response = await axios.get(
      `https://api.catalyst.zoho.in/baas/v1/project/17682000000037195/project-user?start=${start}&end=100`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken.access_token}`,
          Environment: "Production",
        },
      }
    );

    const users = Array.isArray(response.data.data) ? response.data.data : [];

    console.log("page"+page+":"+users.length);

    if (users.length === 0) {
      console.log(`✅ No more users found at page ${page}. Stopping...`);
      return context.closeWithSuccess();
    }

    const targetUsers=users;
    // const targetUsers = users.filter((user) => user.email_id === 'aman@dsvcorp.com.au');

    // console.log(users.length);

    const recordsToInsert = [];
    let successCount = 0;
    let failureCount = 0;

    for (const user of targetUsers) {
      console.log("📧 Sending email to:", user.email_id);

      const record = {
        email_id: user.email_id,
        page_number: page,
        time_stamp: new Date().toISOString(),
      };

      try {
        const emailData = {
          from_email: "catalystadmin@dsv360.ai", // Ensure this is verified
          to_email: user.email_id,
          subject: "New Features Added in DSV 360",
          html_mode: true,
          content: `
                     <!-- Card Container --> <div style="max-width:600px; margin:40px auto; background:#ffffff; border:1px solid #e6e9ef; border-radius:8px;"> <!-- Header --> <div style="padding:20px 24px 10px;"> <img src="https://fristinetech.com/wp-content/uploads/2023/11/Google-Ads-Logo.png" alt="DSV 360" style="max-width:110px;"> </div> <!-- Body --> <div style="padding:0 24px 24px;"> <h2 style="color:#1f2937; margin-top:10px;"> Hello, ${user.first_name} ${user.last_name} </h2> <p style="color:#374151; line-height:1.6;"> We have introduced a few updates in <strong>DSV 360</strong> to improve usability, reporting, and approval workflows. </p> <!-- Features --> <ul style="padding-left:18px; color:#374151; line-height:1.7;"> <li> <strong>Time Entry Timer:</strong> Log time entries faster using the new timer-based workflow. </li> <li> <strong>Reporting & Team Hierarchy:</strong> View reports with team-wise hierarchical visibility. </li> <li> <strong>7-Day Time Entry Rule:</strong> Direct entry is allowed up to 7 days. Older entries require submission via the <strong>Request Entry</strong> option and reporting manager approval. </li> <li> <strong>Leave Approval Flow:</strong> Leave requests are now approved by the reporting manager. </li> </ul> <!-- Feedback --> <p style="color:#374151; line-height:1.6; margin-top:20px;"> Please review these features and share your feedback or report issues through the <strong>DSV Feedback Form</strong>. </p> <!-- Sign-off --> <p style="color:#4b5563; font-size:14px; margin-top:24px;"> Regards,<br> <strong>Product Team</strong> </p> </div> <!-- Footer --> <div style="border-top:1px solid #e6e9ef; padding:14px 24px; text-align:center;"> <p style="margin:0; font-size:12px; color:#6b7280;"> © 2025 DSV 360. All rights reserved. </p> </div> </div> `,
        };
        // await emailService.sendMail(emailData);

        // const reinviteData = {
        //   platform_type: "web",
        //   redirect_url:
        //     "https://project.dsv360.ai/",
        //   user_details: {
        //     email_id: user.email_id,
        //     first_name: user.first_name,
        //     last_name: user.last_name,
        //   },
        //   "template_details": {
        //     "senders_mail":"catalystadmin@dsv360.ai",
        //     "subject": "Reminder: Complete Your DSV 360  Portal Registration",
        //     "message": "<html style=\"background-color: #ffffff;\">\n  <body style=\"font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;\">\n    <div style=\"max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; text-align: left;\">\n      <img src=\"https://esd-development.zohostratus.com/skyi-logo.png\" alt=\"Company Logo\" style=\"max-width: 150px; margin-bottom: 20px;\">\n      \n      <h2 style=\"color: #333;\">Hello, ${user.first_name} ${user.last_name}</h2>\n      <h3 style=\"color: #ff6b00;\">Reminder: Complete Your SKYi Customer Portal Registration</h3>\n      \n      <p style=\"color: #555;\">We noticed you haven’t completed your registration for the <strong>SKYi Customer Portal</strong> yet.</p>\n      <p style=\"color: #555;\">To get started and access your account, please click the button below:</p>\n      \n      <a href=\"%LINK%\" \n         style=\"display: inline-block; padding: 14px 28px; background-color: #ff6b00; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 20px 0; transition: background-color 0.3s ease;\">\n         Accept Invitation\n      </a>\n      \n      <p style=\"color: #555; font-size: 16px; margin-top: 20px;\">\n        Already registered? \n        <a href=\"https://cportal.skyi.com/\" \n           style=\"color: #4B70F5; text-decoration: none; font-weight: bold;\">Click here to log in</a>.\n      </p>\n      \n      <p style=\"color: #777; font-size: 14px;\">Thank you,</p>\n      <p style=\"color: #777; font-size: 14px;\"><strong>SKYi Customer Portal</strong> Team</p>\n      \n      <hr style=\"border: 0; height: 1px; background: #ddd; margin: 20px 0;\">\n      \n      <p style=\"color: #aaa; font-size: 12px;\">© 2025 SKYi Customer Portal. All rights reserved.</p>\n    </div>\n  </body>\n</html>"
        //   }
        // };

        // await axios.post(
        //   "https://api.catalyst.zoho.in/baas/v1/project/17682000000037195/project-user/re-invite",
        //   reinviteData,{
        //     headers: {
        //       "catalyst-org": "60040289923",
        //       "content-type": "application/json",
        //       environment: "Production",
        //       Authorization: `Zoho-oauthtoken ${accessToken.access_token}`,
        //     },
        //   }
        // );

        console.log(`✅ Email sent to ${user.email_id}`);
        successCount++;
        record.status = "success";
        record.error = "No";
      } catch (err) {
        record.status = "false";
        record.error = JSON.stringify(err);
        failureCount++;
        console.error(`❌ Failed to send email to ${user.email_id}: ${err}`);
      }
      recordsToInsert.push(record);
    }

    //save analytics..
    if (recordsToInsert.length > 0) {
      await mailAnalyticsTable.insertRows(recordsToInsert);
      console.log(
        `✅ Inserted ${recordsToInsert.length} analytics records for page ${page}`
      );

      try {
        const adminEmailData = {
          from_email: "catalystadmin@dsv360.ai",
          to_email: "aman@dsvcorp.com.au",
          subject: `DSV 360 Reminder Email Sent Report - Page ${page}`,
          html_mode: true,
          content: `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #eaf3fc; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #cce0ff;">
          <h2 style="color: #003366;">📊 DSV 360 Email Report (Page ${page})</h2>
          <p style="color: #333;">Total Users Processed: <strong>${
            recordsToInsert.length
          }</strong></p>
          <p style="color: green;">✅ Emails Sent Successfully: <strong>${successCount}</strong></p>
          <p style="color: red;">❌ Failed Emails: <strong>${failureCount}</strong></p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #cce0ff;" />
          <p style="font-size: 12px; color: #888;">Generated: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `,
        };

        await emailService.sendMail(adminEmailData);
        console.log(`========REPORT========`);
        console.log("Total Users Processed:", recordsToInsert.length);
        console.log(`✅ Emails Sent Successfully: `, successCount);
        console.log("❌ Failed Emails:", failureCount);
        console.log(`======================`);
      } catch (err) {
        console.error("❌ Error in adding analytics:", err);
      }
    }

    // 🔁 Schedule next page job
    await jobScheduling.JOB.submitJob({
      job_name: `Job_Page_${page + 1}`,
      jobpool_name: "weeklyRemainderJobPool",
      target_type: "Function",
      target_name: "send_remainder_function",
      params: {
        page: page + 1,
      },

      job_config: {
        number_of_retries: 2,
        retry_interval: 900,
      }, // set job config - job retries => 2 retries in 15 mins (optional)
    });

    console.log(`✅ Scheduled Job_Page_${page + 1}`);
  } catch (err) {
    console.error(`❌ Error processing page ${page}: ${err}`);
    return context.closeWithFailure();
  }

  return context.closeWithSuccess();
};
