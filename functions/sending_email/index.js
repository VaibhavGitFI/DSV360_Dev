const catalyst = require("zcatalyst-sdk-node");

module.exports = async (event, context) => {
  const catalystApp = catalyst.initialize(context);
  const emailService = catalystApp.email();
  const jobScheduling = catalystApp.jobScheduling();
  const datastore = catalystApp.datastore();
  const mailAnalyticsTable = datastore.table("Mail_Analytics");

  const page = Number(event.getJobParam("page")) || 1;
  const users = event.getJobParam("users") || [];
  const template = event.getJobParam("template");
  const title=event.getJobParam("title");
  const idx = Number(event.getJobParam("idx")) || 0;

  console.log("page",page);
  console.log("users",users);
  console.log("users",typeof(users));
  console.log("template",template);
  console.log("idx",idx);

  // 🟢 Page 1 = Orchestrator only
  if (page === 1 && idx === 0) {

    try {
      console.log("🚀 Parent job: scheduling first worker job");

      await jobScheduling.JOB.submitJob({
        job_name: "Job_Page_1",
        jobpool_name: "NotificationEmailJobPool",
        target_type: "Function",
        target_name: "sending_email",
        params: {
          page: 2,
          idx: 0,
          template,
          users,
          title
        },
        job_config: {
          number_of_retries: 2,
          retry_interval: 900,
        },
      });

      return context.closeWithSuccess(); // ⛔ EXIT EARLY

    } catch (err) {
      console.error("❌ Error in scheduling first worker job:", err);
      return context.closeWithFailure();
    }

  }


  const BATCH_SIZE = 100;

  try {
    // ✅ Stop condition
    if (idx >= users.length) {
      console.log("✅ All users processed. No further jobs scheduled.");
      return context.closeWithSuccess();
    }

    // ✅ Strictly slice max 100 users
    const targetUsers = users.slice(idx, idx + BATCH_SIZE);

    console.log("targetUsers",targetUsers);

    console.log(
      `📦 Processing Page ${page} | Users ${idx} → ${idx + targetUsers.length - 1}`
    );

    let successCount = 0;
    let failureCount = 0;
    const recordsToInsert = [];

    for (const user of targetUsers) {
      console.log("user",user);
      const record = {
        email_id: user.email_id,
        page_number: page,
        time_stamp: new Date().toISOString(),
      };

      try {
        await emailService.sendMail({
          from_email: "catalystadmin@dsv360.ai",
          to_email: user.email_id,
          subject: title,
          html_mode: true,
          content: template,
        });

        successCount++;
        record.status = "success";
        record.error = "No";
      } catch (err) {
        failureCount++;
        record.status = "failed";
        record.error = err?.message || JSON.stringify(err);
        console.error(`❌ Email failed: ${user.email_id}`, err);
      }

      recordsToInsert.push(record);
    }

    // ✅ Admin report
    await emailService.sendMail({
      from_email: "catalystadmin@dsv360.ai",
      to_email: "aman@dsvcorp.com.au",
      subject: `DSV 360 Email Report – Page ${page}`,
      html_mode: true,
      content: `
        <h2>DSV 360 Email Report</h2>
        <p>Page: ${page}</p>
        <p>Total Processed: ${recordsToInsert.length}</p>
        <p style="color:green;">Success: ${successCount}</p>
        <p style="color:red;">Failed: ${failureCount}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
      `,
    });

    // ✅ Schedule next job ONLY if users remain
    const nextIdx = idx + BATCH_SIZE;
    if (nextIdx < users.length) {
      await jobScheduling.JOB.submitJob({
        job_name: `Job_Page_${page}`,
        jobpool_name: "sendingEmailJobPool",
        target_type: "Function",
        target_name: "sending_email",
        params: {
          page: page + 1,
          idx: nextIdx,
          template,
          users,
          title
        },
        job_config: {
          number_of_retries: 2,
          retry_interval: 900,
        },
      });

      console.log(`⏭️ Scheduled Job_Page_${page + 1}`);
    } else {
      console.log("✅ Final batch processed. No next job needed.");
    }

    return context.closeWithSuccess();
  } catch (err) {
    console.error("❌ Job execution failed:", err);
    return context.closeWithFailure();
  }
};
