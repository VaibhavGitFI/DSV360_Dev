// functions/sprints_management_function/utils/validate.js
"use strict";

/**
 * Lightweight payload validators + normalizers
 * Convention:
 *  - returns { ok: boolean, errors: string[], normalized: object }
 *  - never throws
 */

const PRIORITIES = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
const STORY_STATUSES = new Set([
  // Legacy statuses (backward compat)
  "BACKLOG", "TODO", "IN_PROGRESS", "CODE_REVIEW", "QA", "BLOCKED", "DONE",
  // New statuses
  "NOT_STARTED", "WIP", "UNDER_INTERNAL_TESTING",
  "PENDING_FROM_ZOHO", "PENDING_FROM_CLIENT",
  "RELEASED_FOR_UAT", "UAT_APPROVED_BY_CLIENT", "CLOSED",
]);

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const toStr = (v) => (v === null || v === undefined ? "" : String(v));
const toTrim = (v) => toStr(v).trim();

const toInt = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : def;
};

const isHexColor = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(v || ""));

const toYYYYMMDD = (v) => {
  if (!v) return "";
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY -> YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
};

function result(ok, errors, normalized) {
  return { ok, errors, normalized };
}

function validateCreateMilestonePayload(body) {
  const errors = [];
  const Title = toTrim(body?.Title);
  const ProjectID = toTrim(body?.ProjectID);
  const Description = toTrim(body?.Description);
  const DueDate = toYYYYMMDD(body?.DueDate);

  if (!isNonEmptyString(Title)) errors.push("Title is required");

  return result(errors.length === 0, errors, {
    ProjectID,
    Title,
    Description,
    DueDate,
  });
}

function validateCreateEpicPayload(body) {
  const errors = [];
  const Title = toTrim(body?.Title);
  const ProjectID = toTrim(body?.ProjectID);
  const MilestoneID = toTrim(body?.MilestoneID);
  const Description = toTrim(body?.Description);
  const ColorRaw = toTrim(body?.Color);
  const Color = isHexColor(ColorRaw) ? ColorRaw : "#2563eb";

  if (!isNonEmptyString(MilestoneID)) errors.push("MilestoneID is required");
  if (!isNonEmptyString(Title)) errors.push("Title is required");

  return result(errors.length === 0, errors, {
    ProjectID,
    MilestoneID,
    Title,
    Description,
    Color,
  });
}

function validateCreateStoryPayload(body) {
  const errors = [];
  const Title = toTrim(body?.Title);
  const ProjectID = toTrim(body?.ProjectID);
  const EpicID = toTrim(body?.EpicID);
  const SprintID = toTrim(body?.SprintID); // optional
  const Description = toTrim(body?.Description);
  const Points = toInt(body?.Points, 0);
  const PriorityRaw = toTrim(body?.Priority).toUpperCase();
  const StatusRaw = toTrim(body?.Status).toUpperCase();
  const AssigneeID = toTrim(body?.AssigneeID); // optional

  const Priority = PRIORITIES.has(PriorityRaw) ? PriorityRaw : "MEDIUM";
  const Status = STORY_STATUSES.has(StatusRaw) ? StatusRaw : "NOT_STARTED";

  // 9 new optional fields
  const GroupName = toTrim(body?.GroupName);
  const RequirementType = toTrim(body?.RequirementType);
  const BillingType = toTrim(body?.BillingType);
  const PrimaryOwnership = toTrim(body?.PrimaryOwnership);
  const SecondaryOwnership = toTrim(body?.SecondaryOwnership);
  const FIRemarks = toTrim(body?.FIRemarks);
  const ClientRemarks = toTrim(body?.ClientRemarks);
  const ZohoProductName = toTrim(body?.ZohoProductName);
  const ModuleName = toTrim(body?.ModuleName);

  if (!isNonEmptyString(EpicID)) errors.push("EpicID is required");
  if (!isNonEmptyString(Title)) errors.push("Title is required");

  return result(errors.length === 0, errors, {
    ProjectID,
    EpicID,
    SprintID,
    Title,
    Description,
    Points,
    Priority,
    Status,
    AssigneeID,
    GroupName,
    RequirementType,
    BillingType,
    PrimaryOwnership,
    SecondaryOwnership,
    FIRemarks,
    ClientRemarks,
    ZohoProductName,
    ModuleName,
  });
}

/**
 * Optional: if your sprintController expects this, it’s here.
 * If not used, harmless.
 */
function validateCreateSprintPayload(body) {
  const errors = [];
  const ProjectID = toTrim(body?.ProjectID);
  const SprintName = toTrim(body?.SprintName);
  const Goal = toTrim(body?.Goal);
  const StartDate = toYYYYMMDD(body?.StartDate);
  const EndDate = toYYYYMMDD(body?.EndDate);
  const Status = toTrim(body?.Status) || "ACTIVE";

  if (!isNonEmptyString(SprintName)) errors.push("SprintName is required");
  if (StartDate && EndDate) {
    // simple lexical compare works for YYYY-MM-DD
    if (EndDate < StartDate) errors.push("EndDate cannot be before StartDate");
  }

  return result(errors.length === 0, errors, {
    ProjectID,
    SprintName,
    Goal,
    StartDate,
    EndDate,
    Status,
  });
}

function validateUpdateStoryPayload(body) {
  const errors = [];
  const normalized = {};

  // Optional fields (only apply if provided)
  if (body?.Title !== undefined) normalized.Title = toTrim(body.Title);
  if (body?.Description !== undefined) normalized.Description = toTrim(body.Description);

  if (body?.EpicID !== undefined) normalized.EpicID = toTrim(body.EpicID);
  if (body?.SprintID !== undefined) normalized.SprintID = toTrim(body.SprintID);
  if (body?.AssigneeID !== undefined) normalized.AssigneeID = toTrim(body.AssigneeID);

  if (body?.Points !== undefined) normalized.Points = toInt(body.Points, 0);

  // Priority can come as Priority or Priorityy
  if (body?.Priority !== undefined || body?.Priorityy !== undefined) {
    const prRaw = toTrim(body?.Priorityy ?? body?.Priority).toUpperCase();
    normalized.Priority = PRIORITIES.has(prRaw) ? prRaw : "MEDIUM";
  }

  if (body?.Status !== undefined) {
    const stRaw = toTrim(body.Status).toUpperCase();
    if (!STORY_STATUSES.has(stRaw)) errors.push(`Invalid Status: ${stRaw}`);
    else normalized.Status = stRaw;
  }

  // 9 new optional fields
  if (body?.GroupName !== undefined) normalized.GroupName = toTrim(body.GroupName);
  if (body?.RequirementType !== undefined) normalized.RequirementType = toTrim(body.RequirementType);
  if (body?.BillingType !== undefined) normalized.BillingType = toTrim(body.BillingType);
  if (body?.PrimaryOwnership !== undefined) normalized.PrimaryOwnership = toTrim(body.PrimaryOwnership);
  if (body?.SecondaryOwnership !== undefined) normalized.SecondaryOwnership = toTrim(body.SecondaryOwnership);
  if (body?.FIRemarks !== undefined) normalized.FIRemarks = toTrim(body.FIRemarks);
  if (body?.ClientRemarks !== undefined) normalized.ClientRemarks = toTrim(body.ClientRemarks);
  if (body?.ZohoProductName !== undefined) normalized.ZohoProductName = toTrim(body.ZohoProductName);
  if (body?.ModuleName !== undefined) normalized.ModuleName = toTrim(body.ModuleName);

  // Prevent empty PATCH
  if (Object.keys(normalized).length === 0) {
    errors.push("No updatable fields provided");
  }

  return result(errors.length === 0, errors, normalized);
}


function validateUpdateSprintPayload(body) {
  const errors = [];
  const normalized = {};

  if (body?.SprintName !== undefined) normalized.SprintName = toTrim(body.SprintName);
  if (body?.Goal !== undefined) normalized.Goal = toTrim(body.Goal);
  if (body?.StartDate !== undefined) normalized.StartDate = toYYYYMMDD(body.StartDate);
  if (body?.EndDate !== undefined) normalized.EndDate = toYYYYMMDD(body.EndDate);
  if (body?.Status !== undefined) normalized.Status = toTrim(body.Status);

  if (normalized.StartDate && normalized.EndDate && normalized.EndDate < normalized.StartDate) {
    errors.push("EndDate cannot be before StartDate");
  }

  if (Object.keys(normalized).length === 0) {
    errors.push("No updatable fields provided");
  }

  return result(errors.length === 0, errors, normalized);
}

function validateUpdateMilestonePayload(body) {
  const errors = [];
  const normalized = {};

  if (body?.Title !== undefined) normalized.Title = toTrim(body.Title);
  if (body?.Description !== undefined) normalized.Description = toTrim(body.Description);
  if (body?.DueDate !== undefined) normalized.DueDate = toYYYYMMDD(body.DueDate);

  if (Object.keys(normalized).length === 0) {
    errors.push("No updatable fields provided");
  }

  return result(errors.length === 0, errors, normalized);
}

function validateUpdateEpicPayload(body) {
  const errors = [];
  const normalized = {};

  if (body?.Title !== undefined) normalized.Title = toTrim(body.Title);
  if (body?.Description !== undefined) normalized.Description = toTrim(body.Description);
  if (body?.MilestoneID !== undefined) normalized.MilestoneID = toTrim(body.MilestoneID);
  if (body?.Color !== undefined) {
    const c = toTrim(body.Color);
    normalized.Color = isHexColor(c) ? c : "#2563eb";
  }

  if (Object.keys(normalized).length === 0) {
    errors.push("No updatable fields provided");
  }

  return result(errors.length === 0, errors, normalized);
}

function validateCreateTaskPayload(body) {
  const errors = [];
  const Title = toTrim(body?.Title);
  const StoryID = toTrim(body?.StoryID);
  const ProjectID = toTrim(body?.ProjectID);
  const Description = toTrim(body?.Description);
  const StatusRaw = toTrim(body?.Status).toUpperCase();
  const Status = STORY_STATUSES.has(StatusRaw) ? StatusRaw : "TODO";
  const EstimatedHours = toInt(body?.EstimatedHours, 0);
  const AssigneeID = toTrim(body?.AssigneeID);
  const DueDate = toYYYYMMDD(body?.DueDate);

  if (!isNonEmptyString(Title)) errors.push("Title is required");
  if (!isNonEmptyString(StoryID)) errors.push("StoryID is required");

  return result(errors.length === 0, errors, {
    ProjectID,
    StoryID,
    Title,
    Description,
    Status,
    EstimatedHours,
    AssigneeID,
    DueDate,
  });
}

function validateUpdateTaskPayload(body) {
  const errors = [];
  const normalized = {};

  if (body?.Title !== undefined) normalized.Title = toTrim(body.Title);
  if (body?.Description !== undefined) normalized.Description = toTrim(body.Description);
  if (body?.StoryID !== undefined) normalized.StoryID = toTrim(body.StoryID);
  if (body?.AssigneeID !== undefined) normalized.AssigneeID = toTrim(body.AssigneeID);
  if (body?.EstimatedHours !== undefined) normalized.EstimatedHours = toInt(body.EstimatedHours, 0);
  if (body?.DueDate !== undefined) normalized.DueDate = toYYYYMMDD(body.DueDate);

  if (body?.Status !== undefined) {
    const stRaw = toTrim(body.Status).toUpperCase();
    if (!STORY_STATUSES.has(stRaw)) errors.push(`Invalid Status: ${stRaw}`);
    else normalized.Status = stRaw;
  }

  if (Object.keys(normalized).length === 0) {
    errors.push("No updatable fields provided");
  }

  return result(errors.length === 0, errors, normalized);
}

function validateCreateSubTaskPayload(body) {
  const errors = [];
  const Title = toTrim(body?.Title);
  const TaskID = toTrim(body?.TaskID);
  const StoryID = toTrim(body?.StoryID);
  const ProjectID = toTrim(body?.ProjectID);
  const Description = toTrim(body?.Description);
  const StatusRaw = toTrim(body?.Status).toUpperCase();
  const Status = STORY_STATUSES.has(StatusRaw) ? StatusRaw : "TODO";
  const EstimatedHours = toInt(body?.EstimatedHours, 0);
  const AssigneeID = toTrim(body?.AssigneeID);
  const DueDate = toYYYYMMDD(body?.DueDate);

  if (!isNonEmptyString(Title)) errors.push("Title is required");
  if (!isNonEmptyString(TaskID)) errors.push("TaskID is required");
  if (!isNonEmptyString(StoryID)) errors.push("StoryID is required");

  return result(errors.length === 0, errors, {
    ProjectID,
    TaskID,
    StoryID,
    Title,
    Description,
    Status,
    EstimatedHours,
    AssigneeID,
    DueDate,
  });
}

function validateUpdateSubTaskPayload(body) {
  const errors = [];
  const normalized = {};

  if (body?.Title !== undefined) normalized.Title = toTrim(body.Title);
  if (body?.Description !== undefined) normalized.Description = toTrim(body.Description);
  if (body?.AssigneeID !== undefined) normalized.AssigneeID = toTrim(body.AssigneeID);
  if (body?.EstimatedHours !== undefined) normalized.EstimatedHours = toInt(body.EstimatedHours, 0);
  if (body?.DueDate !== undefined) normalized.DueDate = toYYYYMMDD(body.DueDate);

  if (body?.Status !== undefined) {
    const stRaw = toTrim(body.Status).toUpperCase();
    if (!STORY_STATUSES.has(stRaw)) errors.push(`Invalid Status: ${stRaw}`);
    else normalized.Status = stRaw;
  }

  if (Object.keys(normalized).length === 0) {
    errors.push("No updatable fields provided");
  }

  return result(errors.length === 0, errors, normalized);
}

module.exports = {
  validateCreateMilestonePayload,
  validateCreateEpicPayload,
  validateCreateStoryPayload,
  validateCreateSprintPayload,
  validateUpdateStoryPayload,
  validateUpdateSprintPayload,
  validateUpdateMilestonePayload,
  validateUpdateEpicPayload,
  validateCreateTaskPayload,
  validateUpdateTaskPayload,
  validateCreateSubTaskPayload,
  validateUpdateSubTaskPayload,
};

