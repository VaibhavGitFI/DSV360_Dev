const catalyst = require("zcatalyst-sdk-node");

/* ================= IST UTILITIES ================= */

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

const pad = (n) => n.toString().padStart(2, '0');

function nowIST() {
  return new Date(Date.now() + IST_OFFSET);
}

function parseIST(dateTimeStr) {
  // Treat DB value as IST
  const d = new Date(dateTimeStr.replace(' ', 'T') + 'Z');
  return new Date(d.getTime() + IST_OFFSET);
}

function formatIST(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function add24HoursIST(dateTimeStr) {
  const date = parseIST(dateTimeStr);
  date.setHours(date.getHours() + 24);
  return formatIST(date);
}

/* ================= JOB CONSTANTS ================= */

const BATCH_SIZE = 20;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ================= JOB FUNCTION ================= */

module.exports = async (jobRequest, context) => {
  const catalystApp = catalyst.initialize(context);
  const emailService = catalystApp.email();
  const zcql = catalystApp.zcql();
  const datastore = catalystApp.datastore();
  const jobScheduling = catalystApp.jobScheduling();

  console.log(JSON.stringify({
    level: "INFO",
    event: "JOB_STARTED",
    params: jobRequest.getAllJobParams?.(),
    startedAt: formatIST(nowIST())
  }));

  let lastAttendanceRowId = Number(jobRequest.getJobParam("lastAttendanceRowId")) || 0;
  let lastTimeEntryRowId = Number(jobRequest.getJobParam("lastTimeEntryRowId")) || 0;

  // IST-safe cutoff time
  const cutoffTime = formatIST(
    new Date(nowIST().getTime() - 24 * 60 * 60 * 1000)
  );

  console.log(JSON.stringify({
    level: "DEBUG",
    event: "CUTOFF_CALCULATED",
    cutoffTime,
    lastAttendanceRowId,
    lastTimeEntryRowId,
    batchSize: BATCH_SIZE
  }));

  try {
    /* ================= Attendance Logs ================= */

    const attendanceLogs = await zcql.executeZCQLQuery(`
      SELECT ROWID, Check_In
      FROM Attendance_Logs
      WHERE Check_Out IS NULL
        AND Check_In <= '${cutoffTime}'
        AND ROWID > ${lastAttendanceRowId}
      ORDER BY ROWID
      LIMIT ${BATCH_SIZE}
    `);

    console.log(JSON.stringify({
      level: "INFO",
      event: "ATTENDANCE_BATCH_FETCHED",
      count: attendanceLogs.length
    }));

    for (const log of attendanceLogs) {
      const row = log.Attendance_Logs;

      try {
        await datastore.table("Attendance_Logs").updateRow({
          ROWID: row.ROWID,
          Check_Out: add24HoursIST(row.Check_In),
          Total_Time: "1440"
        });

        console.log(JSON.stringify({
          level: "INFO",
          event: "ATTENDANCE_ROW_UPDATED",
          rowId: row.ROWID
        }));

        lastAttendanceRowId = row.ROWID;
        await sleep(50);

      } catch (rowErr) {
        console.error(JSON.stringify({
          level: "ERROR",
          event: "ATTENDANCE_UPDATE_FAILED",
          rowId: row.ROWID,
          error: rowErr.message
        }));
      }
    }

    /* ================= Time Entry Logs ================= */

    const timeEntries = await zcql.executeZCQLQuery(`
      SELECT ROWID, Start_time
      FROM Time_Entry_Logs
      WHERE End_time IS NULL
        AND isRejected = false
        AND Start_time <= '${cutoffTime}'
        AND ROWID > ${lastTimeEntryRowId}
      ORDER BY ROWID
      LIMIT ${BATCH_SIZE}
    `);

    console.log(JSON.stringify({
      level: "INFO",
      event: "TIME_ENTRY_BATCH_FETCHED",
      count: timeEntries.length
    }));

    for (const log of timeEntries) {
      const row = log.Time_Entry_Logs;

      try {
        await datastore.table("Time_Entry_Logs").updateRow({
          ROWID: row.ROWID,
          isRejected: true
        });

        console.log(JSON.stringify({
          level: "INFO",
          event: "TIME_ENTRY_ROW_UPDATED",
          rowId: row.ROWID
        }));

        lastTimeEntryRowId = row.ROWID;
        await sleep(50);

      } catch (rowErr) {
        console.error(JSON.stringify({
          level: "ERROR",
          event: "TIME_ENTRY_UPDATE_FAILED",
          rowId: row.ROWID,
          error: rowErr.message
        }));
      }
    }

    /* ================= Schedule Next Batch ================= */

    if (attendanceLogs.length === BATCH_SIZE || timeEntries.length === BATCH_SIZE) {
      await jobScheduling.JOB.submitJob({
        job_name: `StopTimer_${Date.now()}`,
        jobpool_name: "StopTimerJobPool",
        target_type: "Function",
        target_name: "stop_timer_function",
        params: {
          lastAttendanceRowId,
          lastTimeEntryRowId
        },
        job_config: {
          number_of_retries: 2,
          retry_interval: 900
        }
      });

      console.log(JSON.stringify({
        level: "INFO",
        event: "NEXT_JOB_SCHEDULED",
        nextAttendanceCursor: lastAttendanceRowId,
        nextTimeEntryCursor: lastTimeEntryRowId
      }));
    }

    console.log(JSON.stringify({
      level: "INFO",
      event: "JOB_COMPLETED",
      endedAt: formatIST(nowIST())
    }));

    context.closeWithSuccess();

  } catch (err) {
    console.error(JSON.stringify({
      level: "FATAL",
      event: "JOB_FAILED",
      error: err.message,
      stack: err.stack
    }));

    await emailService.sendMail({
      from_email: "catalystadmin@dsv360.ai",
      to_email: "aman@dsvcorp.com.au",
      subject: "DSV 360 CloseTimer Service Error",
      html_mode: true,
      content: `
        <h2>DSV 360 CloseTimer Service Error</h2>
        <p><b>Error:</b> ${err.message}</p>
        <pre>${err.stack}</pre>
        <p>Generated: ${formatIST(nowIST())}</p>
      `
    });

    context.closeWithFailure();
  }
};
