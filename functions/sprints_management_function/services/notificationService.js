"use strict";

/**
 * Fire-and-forget email notification when a task/story/subtask is assigned.
 * Failures are logged but never propagated to the caller.
 */
async function sendAssignmentEmail(catalystApp, { assigneeId, itemType, title, status, dueDate, assignerName }) {
  if (!assigneeId) return;

  try {
    const userDetails = await catalystApp.userManagement().getUserDetails(assigneeId);
    const email = userDetails?.email_id;
    if (!email) {
      console.warn("[NotificationService] No email found for assignee:", assigneeId);
      return;
    }

    const firstName = userDetails.first_name || "";
    const lastName = userDetails.last_name || "";
    const typeLabel = (itemType || "Item").replace(/_/g, " ");
    const statusDisplay = (status || "TODO").replace(/_/g, " ");
    const dueLine = dueDate
      ? `<tr>
           <td style="padding: 10px 14px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Due Date</td>
           <td style="padding: 10px 14px; color: #333; border-bottom: 1px solid #eee;">${dueDate}</td>
         </tr>`
      : "";

    const html = `<html>
<body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #555;">
  <div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: left;">

    <!-- Logo -->
    <img alt="DSV360 Logo" width="90" height="70"
         src="https://fristinetech.com/wp-content/uploads/2023/11/Google-Ads-Logo.png"
         style="max-width: 120px; margin-bottom: 20px;">

    <!-- Heading -->
    <h2 style="color: #333; font-size: 28px; margin-bottom: 10px; font-weight: bold;">
      Hello, ${firstName} ${lastName}
    </h2>

    <!-- Subheading -->
    <h3 style="color: #333; font-size: 20px; margin-bottom: 20px; font-weight: normal;">
      A new <span style="color: #007BFF; font-weight: bold;">${typeLabel}</span> has been assigned to you
    </h3>

    <!-- Message -->
    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
      ${assignerName ? `<strong>${assignerName}</strong> has assigned` : "You have been assigned"} the following ${typeLabel.toLowerCase()} on <strong>DSV360 Portal</strong>:
    </p>

    <!-- Task Details Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; border: 1px solid #eee; border-radius: 6px;">
      <tr style="background-color: #f9fafb;">
        <td style="padding: 10px 14px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Title</td>
        <td style="padding: 10px 14px; color: #333; font-weight: bold; border-bottom: 1px solid #eee;">${title || "Untitled"}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Type</td>
        <td style="padding: 10px 14px; color: #333; border-bottom: 1px solid #eee;">${typeLabel}</td>
      </tr>
      <tr style="background-color: #f9fafb;">
        <td style="padding: 10px 14px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Status</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eee;">
          <span style="display: inline-block; padding: 4px 12px; background-color: #007BFF; color: #ffffff; border-radius: 4px; font-size: 12px; font-weight: bold;">${statusDisplay}</span>
        </td>
      </tr>
      ${dueLine}
    </table>

    <!-- Button -->
    <a href="https://dsv360.ai"
       style="display: inline-block; padding: 14px 28px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 20px 0;">
      Open DSV360
    </a>

    <!-- Disclaimer -->
    <p style="color: #777; font-size: 14px; margin-top: 20px;">
      If you believe this was sent by mistake, please contact your project manager.
    </p>

    <p style="color: #777; font-size: 14px;">
      Best regards, <br>
      The <strong>DSV360</strong> Team
    </p>

    <!-- Divider -->
    <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

    <!-- Footer -->
    <p style="color: #aaa; font-size: 12px; text-align: left;">
      &copy; 2025 DSV360. All rights reserved.
    </p>
  </div>
</body>
</html>`;

    await catalystApp.email().sendMail({
      from_email: "catalystadmin@dsv360.ai",
      to_email: email,
      subject: `[DSV 360] ${typeLabel} assigned: ${title || "Untitled"}`,
      content: html,
      html_mode: true,
    });

    console.log(`[NotificationService] Assignment email sent to ${email} for ${typeLabel}: "${title}"`);
  } catch (err) {
    console.error("[NotificationService] Failed to send assignment email:", err?.message || err);
  }
}

module.exports = { sendAssignmentEmail };
