# DSV360 Changelog

All notable changes to this project will be documented in this file.
Format: Each change includes the date, description, exact files modified, what was changed, and rollback instructions.

---

## [2026-02-23] Bugfix — Sprint UX: Overlap Errors, Timer Counter, Dark Mode Inputs

### Bug Fix 5: Retry Logic Causing Double Submissions & Hiding Real Error Messages

**Root Cause:** The `handleLogTimeSubmit` and `handleStartTimer` functions in `IssueDetailDrawer.jsx` had a try-catch retry pattern that caught ALL errors. When the server returned a 400 (e.g., "Time slot overlaps or invalid"), the catch would retry without sprint fields — which also returned 400 (same overlap). This caused 2 failed requests per click and the user only saw a generic "Failed to add time entry" message instead of the actual "Time slot overlaps or invalid" from the server.

**Fix:**
- Inner catch now only retries on HTTP 500 (server/column error). For any other status (400 validation, etc.), it re-throws.
- Outer catch now shows the actual server error message: `err.response?.data?.message || "Failed to add time entry"`.

**Affected File:** `react-app/src/components/sprints/IssueDetailDrawer.jsx`

---

### Bug Fix 6: Timer Elapsed Counter Not Visible

**Root Cause:** When a timer was started, there was no elapsed time display — the user had no visual feedback that the timer was running or how long it had been running.

**Fix:** Added a `timerElapsed` state with a `useEffect` that ticks every second, computing `HH:MM:SS` from the timer's `startTime`. The elapsed time is displayed:
- Next to the "Stop Timer" button in the task card (red monospace pill)
- In the "Stop Timer" dialog header

**Affected File:** `react-app/src/components/sprints/IssueDetailDrawer.jsx`

---

### Bug Fix 7: Date/Time Picker Icons Black in Dark Mode

**Root Cause:** Native `<input type="date">` and `<input type="time">` elements use the browser's default color scheme for their calendar/clock icons. In dark mode, these icons remained black (invisible against the dark background).

**Fix:** Added `colorScheme: mode === "dark" ? "dark" : "light"` to the inline style of all date, time, and select inputs in:
- Task-level log time form (3 inputs: date, start time, end time + select)
- Subtask-level log time form (3 inputs: date, start time, end time + select)
- Stop Timer dialog (select dropdown)

**Affected File:** `react-app/src/components/sprints/IssueDetailDrawer.jsx`

---

## [2026-02-23] Bugfix — Sprint Time Entry, Timer & User Icon

### Bug Fix 1: Timer API Endpoints Returning 404 (IssueDetailDrawer.jsx)

**Root Cause:** The `IssueDetailDrawer.jsx` component (Sprints module) was using incorrect API paths for all timer operations. The paths were missing the `/timeentry` prefix required by the backend route definitions in `index.js` (lines 168-170).

**Affected File:** `react-app/src/components/sprints/IssueDetailDrawer.jsx`

| Operation     | Broken Path (Before)   | Fixed Path (After)          | Line |
|---------------|------------------------|-----------------------------|------|
| Check Timer   | `/timer/check`         | `/timeentry/timer`          | 53   |
| Start Timer   | `/timer/start`         | `/timeentry/timer/start`    | 163, 166 |
| Stop Timer    | `/timer/end`           | `/timeentry/timer/end`      | 183  |

---

### Bug Fix 2: Time Entry & Timer Insert Returning 500 — Foreign Key Violation on Task_ID

**Root Cause:** The `Task_ID` column in both `Time_Entries` and `Time_Entry_Logs` Zoho Catalyst DataStore tables has a **foreign key constraint** referencing `ROWID` of the `Tasks` table. When creating time entries from the Sprints module, the `Task_ID` value sent is a sprint task identifier (not a ROWID from the `Tasks` table), causing Zoho Catalyst to reject the insert with:

```
"Invalid Foreign key value for column Task_ID, ROWID of table Tasks is expected"
```

**Fix:** In all backend functions that insert into `Time_Entries` or `Time_Entry_Logs`, the `Task_ID` field is now removed from the insert payload when the entry is sprint-sourced (identified by `Source_Type` starting with `"SPRINT"`). The sprint task reference is preserved in the `Sprint_Task_ID` column instead.

**Affected File:** `functions/time_entry_management_application_function/controller/timeEntryController.js`

**Functions Modified:**
- **`createTimeEntry`** — Added check after `cleanSprintFields()`: if `Source_Type` starts with `"SPRINT"`, delete `Task_ID` from insert payload.
- **`startTimer`** — Same check before `insertRow()` into `Time_Entry_Logs`.
- **`endTimer`** — Same check before `insertRow()` into `Time_Entries` (when stopping a timer and creating the final time entry).
- **`approveTimeEntry`** — Same per-entry check in bulk `insertRows()`.

**Code pattern applied in each function:**
```js
if (insertPayload.Source_Type && insertPayload.Source_Type.startsWith("SPRINT")) {
  delete insertPayload.Task_ID;
}
```

---

### Bug Fix 3: Sprint Fields Sending Empty Strings from Frontend

**Root Cause:** `IssueDetailDrawer.jsx` was sending sprint fields with empty string values (`""`) for optional fields. While the backend's `cleanSprintFields()` strips falsy values, `Source_Type` was always truthy (`"SPRINT_TASK"`), so if other sprint columns didn't exist in the DataStore, the first insert attempt failed. The retry also failed due to the FK issue above.

**Fix:** Changed the frontend to only include sprint fields with actual non-empty values.

**Affected File:** `react-app/src/components/sprints/IssueDetailDrawer.jsx`

**Before:**
```js
Sprint_ID: selectedStory?.sprintId || "",
Story_ID: selectedStory?.id || "",
Sprint_SubTask_ID: logTimeTarget.subTaskId || "",
```

**After:**
```js
const sprintFields = {};
if (sourceType) sprintFields.Source_Type = sourceType;
if (selectedStory?.sprintId) sprintFields.Sprint_ID = selectedStory.sprintId;
if (selectedStory?.id) sprintFields.Story_ID = selectedStory.id;
// ... only include non-empty values
```

---

### Bug Fix 4: User Avatar — Infinite Re-renders & Generic "U" Fallback

**Root Cause (Re-renders):** The `useEffect` hook reading the profile picture URL from `localStorage` had **no dependency array**, causing it to execute on every render cycle.

**Root Cause (Fallback):** When the Zoho Stratus profile image URL fails to load in the dev environment, the MUI `Avatar` falls back to the first letter of `alt="User Avatar"` — showing a generic `"U"` instead of the user's actual initial.

**Fix:**
- Added `[location.pathname]` dependency array to the `useEffect`.
- Added a children element to `Avatar` that reads the user's first name initial from `localStorage`, so the fallback shows e.g. `"V"` for Vaibhav.

**Affected Files:**
- `react-app/src/Admin/Layout1.jsx` (lines ~136, ~286)
- `react-app/src/Employee/Layout1.jsx` (lines ~716, ~959)

---

### Files Changed Summary (This Bugfix)

| File | Changes |
|------|---------|
| `react-app/src/components/sprints/IssueDetailDrawer.jsx` | Fixed 3 timer API paths; fixed sprint fields sending empty strings |
| `functions/.../controller/timeEntryController.js` | Strip `Task_ID` from insert for sprint-sourced entries in 4 functions |
| `react-app/src/Admin/Layout1.jsx` | Fixed useEffect dependency array; improved Avatar fallback initial |
| `react-app/src/Employee/Layout1.jsx` | Fixed useEffect dependency array; improved Avatar fallback initial |

### Note on Profile Picture Loading

The profile picture not loading in dev is an **infrastructure issue** — Zoho Stratus image URLs (`dsv365-development.zohostratus.in`) may not be accessible from the browser in the local dev environment due to CORS or authentication restrictions. The code fallback (user initial) now handles this gracefully. No code fix can resolve Stratus access in dev — this requires Stratus bucket/CORS configuration.

---

## [2026-02-23] Sprint Time Entry Integration

### Step 1 — Schema Changes (Manual via Zoho Catalyst Console)

**Tables modified:** `Time_Entries`, `Time_Entry_Logs`

5 new columns added to **each** table:

| Column             | Type    | Nullable | Default | Description                                        |
|--------------------|---------|----------|---------|----------------------------------------------------|
| `Source_Type`      | varchar | Yes      | NULL    | `SPRINT_TASK` or `SPRINT_SUBTASK`; empty = legacy  |
| `Sprint_ID`        | varchar | Yes      | NULL    | ROWID of the Sprint                                |
| `Story_ID`         | varchar | Yes      | NULL    | ROWID of the Story                                 |
| `Sprint_Task_ID`   | varchar | Yes      | NULL    | ROWID of the Sprint Task                           |
| `Sprint_SubTask_ID`| varchar | Yes      | NULL    | ROWID of the Sprint SubTask                        |

**Why:** Enable time entries to be linked back to sprint tasks/subtasks while keeping legacy task entries unaffected (NULL = legacy).

**Rollback:** Delete these 5 columns from both `Time_Entries` and `Time_Entry_Logs` via Zoho Catalyst Data Store console. Existing rows are unaffected (columns are nullable, default NULL).

---

### Step 2 — Backend: Time Entry Controller Updates

**File:** `functions/time_entry_management_application_function/controller/timeEntryController.js`

#### 2a. Added helper functions (lines 28–47)

- **`SPRINT_FIELD_KEYS`** — Constant array of the 5 sprint column names.
- **`pickSprintFields(obj)`** — Extracts only truthy sprint field values from a payload object. Used when building insert payloads from in-memory objects (e.g., timer log records).
- **`cleanSprintFields(obj)`** — Clones an object and **removes** any sprint field keys that have empty/falsy values. This prevents Zoho Catalyst from rejecting empty strings on `insertRow()`/`updateRow()` calls.

**Why `cleanSprintFields` was needed (bugfix):** The frontend sends all 5 sprint fields in the POST body, including empty strings (e.g., `Sprint_SubTask_ID: ""`). Zoho Catalyst's `insertRow()` rejects empty string values for varchar columns — it expects either a real value or the key to be absent. Initial implementation caused a 500 Internal Server Error on save. Fixed by stripping empty sprint keys before insert.

#### 2b. `createTimeEntry` (POST /timeentry) — line ~249

**Before:** `await table.insertRow(timeEntryData)`
**After:** `await table.insertRow(cleanSprintFields(timeEntryData))`

- The full `req.body` is cleaned of empty sprint fields before insert.
- If `Source_Type` is present and non-empty (e.g., `"SPRINT_TASK"`), it and other sprint fields are preserved.
- If no sprint fields are sent (legacy flow), nothing changes — backward compatible.

#### 2c. `updateTimeEntry` (POST /timeentry/:id) — line ~336

**Before:** `await table.updateRow({ ROWID, ...timeEntryData })`
**After:** `await table.updateRow({ ROWID, ...cleanSprintFields(timeEntryData) })`

- Same empty-string protection applied to updates.

#### 2d. `startTimer` (POST /timer/start) — line ~1002

**Before:** `insertRow()` with only core fields (Project_ID, Task_ID, etc.)
**After:** `insertRow()` now spreads `...pickSprintFields(req.body)` into the payload.

- Sprint fields from the request body are stored in the `Time_Entry_Logs` row alongside the running timer.
- `pickSprintFields` already filters out falsy values, so no empty strings reach the insert.

#### 2e. `endTimer` (POST /timer/end) — line ~1075

**Before:** `newTimeEntry` object built only from core `timerLog` fields.
**After:** `const sprintFields = pickSprintFields(timerLog);` then `...sprintFields` spread into `newTimeEntry`.

- When a timer is stopped, sprint fields stored in the `Time_Entry_Logs` record are carried into the new `Time_Entries` row.
- Ensures timer-based sprint time entries are correctly tagged.

#### 2f. `checkTimerForUser` (GET /timer/check) — line ~910

**Before:** Response included only `TimerId`, `Task_ID`, `Task_Name`, `Entry_Date`, `startTime`.
**After:** Response now also includes `Source_Type`, `Sprint_ID`, `Story_ID`, `Sprint_Task_ID`, `Sprint_SubTask_ID` (null for legacy timers).

- Allows the frontend to know if a running timer is sprint-related.

#### 2g. `approveTimeEntry` (POST /timeentry/approval) — line ~647

**Before:** `await timeEntryTable.insertRows(timeEntriesArray)`
**After:** `const cleanedEntries = timeEntriesArray.map(entry => cleanSprintFields(entry));` then `insertRows(cleanedEntries)`.

- Each entry in the parsed `Timeentry_Data` JSON array is cleaned before bulk insert.

#### 2h. `createTimeEntryApproval` (POST /timeentry/approval/bulk) — No code change needed

- This function stores `req.body` (including `Timeentry_Data` JSON string) into the `Time_Entry_Approvals` table.
- Sprint fields live inside the JSON string and are preserved as-is.
- They are cleaned when the approval is processed (step 2g above).

**Rollback:** Revert `timeEntryController.js` to commit `f9de031`. Sprint fields are optional — removing the code has no effect on existing data or legacy flows.

---

### Step 3 — Frontend: Sprint IssueDetailDrawer (Log Time + Timer)

**File:** `react-app/src/components/sprints/IssueDetailDrawer.jsx`

#### 3a. New imports (line 1)

- Added `useEffect`, `useCallback` to React imports.
- Added `import axios from "axios"` for API calls.

#### 3b. New props accepted by component

- `projectId` — The selected project ROWID from `AppStateContext`.
- `projectName` — The selected project name.

#### 3c. Current user from localStorage (line ~30)

- `currUser` memoized from `localStorage.getItem("currUser")`.
- Provides `userid`, `firstName`, `lastName` for time entry payloads.

#### 3d. Log Time state and handlers (lines ~33–100)

- **`logTimeTarget`** — Tracks which task/subtask the form is open for (`{ taskId, subTaskId }`).
- **`logTimeForm`** — Form fields: `date`, `startTime`, `endTime`, `note`, `type`.
- **`openLogTime(taskId, subTaskId)`** — Opens inline form with today's date pre-filled.
- **`closeLogTime()`** — Closes form and clears messages.
- **`formatTimeToAMPM(timeStr)`** — Converts "HH:mm" to "H:MM AM/PM" format for the API.
- **`handleLogTimeSubmit()`** — Validates form, calculates total minutes, sends POST to `/server/time_entry_management_application_function/timeentry` with:
  - All standard fields (Username, User_ID, Entry_Date, Note, Type, Start_time, End_time, Total_time, Task_ID, Task_Name, Project_ID, Project_Name)
  - Sprint fields: `Source_Type` ("SPRINT_TASK" or "SPRINT_SUBTASK"), `Sprint_ID`, `Story_ID`, `Sprint_Task_ID`, `Sprint_SubTask_ID`
  - Shows success/error message inline. Auto-closes form after 1.2s on success.

#### 3e. Timer state and handlers (lines ~100–155)

- **`timerRunning`** — Tracks running timer (`{ timerId, taskId, startTime }`).
- **`useEffect` on mount** — Calls `GET /timer/check?User_ID=...` to detect any already-running timer.
- **`handleStartTimer(taskId, subTaskId)`** — POST to `/timer/start` with sprint fields. Updates `timerRunning` state on success.
- **`handleStopTimer(note, type)`** — POST to `/timer/end` with ROWID, Note, Type. Clears `timerRunning` on success.
- **Stop Timer dialog state** — `stopTimerOpen`, `stopNote`, `stopType` for the modal prompt.

#### 3f. UI: Task action buttons (after task detail grid)

For each expanded task card:
- **"+ Log Time" button** — Green, opens inline log time form for the task.
- **"Start Timer" button** — Blue, starts a timer for the task. Disabled if another timer is running.
- **"Stop Timer" button** — Red, shown instead of Start when this task's timer is running. Opens stop dialog.

#### 3g. UI: Inline Log Time form (task level)

Shown below the action buttons when `logTimeTarget` matches the task:
- Row 1: Date picker (pre-filled today), Start time, End time
- Row 2: Note text input (max 700 chars), Type dropdown (Billable/Non-Billable)
- Row 3: Save button, Cancel button, status message

#### 3h. UI: Subtask "Log Time" button

Each subtask row now has a "Log Time" button in the detail row (right side, next to estimated hours and due date).

#### 3i. UI: Inline Log Time form (subtask level)

Same form as task level but rendered inside the subtask card when `logTimeTarget` matches the subtask. Slightly smaller styling to fit the nested layout.

#### 3j. UI: Stop Timer dialog

Fixed-position overlay modal with:
- Note input (required, max 700 chars)
- Type dropdown (Billable/Non-Billable)
- "Stop & Save" button (disabled until note is entered)
- Cancel button

**Rollback:** Revert `IssueDetailDrawer.jsx` to commit `f9de031`.

---

### Step 3.1 — Frontend: Pass project context to IssueDetailDrawer

**File:** `react-app/src/Admin/Sprints.jsx`

**Change:** Added two new props to the `<IssueDetailDrawer>` component call (line ~693):
```jsx
projectId={selectedProjectId}
projectName={selectedProjectName}
```

- `selectedProjectId` comes from `useAppState()` context.
- `selectedProjectName` is computed via `useMemo` from Redux project data.

**Why:** The IssueDetailDrawer needs project context to populate `Project_ID` and `Project_Name` in time entry API calls.

**Rollback:** Remove the two prop lines from `Sprints.jsx`.

---

### Step 4 — Frontend: Sprint/Task Source Badge in Time Entry Views

#### 4a. Employee Time Entry View

**File:** `react-app/src/Employee/TimeEntry.jsx`

**Table header change:** Added a new "Source" column header between "Type" and "Note" columns (after the Type `<TableCell>` in `<TableHead>`).

**Table row change:** Added a new `<TableCell>` in each detail row that renders:
- Purple `<Chip label="Sprint" />` with white text and `backgroundColor: "#7c3aed"` — shown when `entry.Time_Entries.Source_Type` is truthy.
- Outlined `<Chip label="Task" variant="outlined" />` — shown when `Source_Type` is empty/null (legacy entries).

**Rollback:** Revert `react-app/src/Employee/TimeEntry.jsx` to commit `f9de031`.

#### 4b. Admin Time Entry View

**File:** `react-app/src/Admin/TimeEntry.jsx`

**Identical changes** to Employee view:
- Added "Source" column header.
- Added Source badge `<TableCell>` in detail rows with same Sprint/Task chip logic.

**Rollback:** Revert `react-app/src/Admin/TimeEntry.jsx` to commit `f9de031`.

---

### Bugfix — 500 Error on Sprint Time Entry Save

**Date:** 2026-02-23
**File:** `functions/time_entry_management_application_function/controller/timeEntryController.js`

**Problem:** Clicking "Save" on the Log Time form returned 500 Internal Server Error.

**Root cause:** The frontend sends all 5 sprint fields in the POST body, including empty strings (e.g., `Sprint_SubTask_ID: ""`). Zoho Catalyst's `insertRow()` rejects empty string values for varchar columns — it expects either a real value or the key to be completely absent from the payload.

**Fix:** Added `cleanSprintFields()` helper function that strips out any sprint field key with an empty/falsy value before the object reaches `insertRow()`, `updateRow()`, or `insertRows()`. Applied to:
- `createTimeEntry` — `cleanSprintFields(timeEntryData)` before `insertRow()`
- `updateTimeEntry` — `cleanSprintFields(timeEntryData)` before `updateRow()`
- `approveTimeEntry` — `cleanedEntries = timeEntriesArray.map(cleanSprintFields)` before `insertRows()`

**Rollback:** Included in the main controller rollback (revert to commit `f9de031`).

---

## Summary of All Modified Files

| File | Type | Changes |
|------|------|---------|
| `functions/.../controller/timeEntryController.js` | Backend | Added `pickSprintFields()`, `cleanSprintFields()`, updated 6 functions |
| `react-app/src/components/sprints/IssueDetailDrawer.jsx` | Frontend | Added Log Time form, timer start/stop, stop dialog, sprint API fields |
| `react-app/src/Admin/Sprints.jsx` | Frontend | Added `projectId`, `projectName` props to IssueDetailDrawer |
| `react-app/src/Employee/TimeEntry.jsx` | Frontend | Added "Source" column with Sprint/Task badge |
| `react-app/src/Admin/TimeEntry.jsx` | Frontend | Added "Source" column with Sprint/Task badge |

---

## [2026-02-11] Previous Release

- Sprint management module (stories, tasks, subtasks)
- Time entry timer for employees
- Manager tracking module
- Employee metadata enhancements
