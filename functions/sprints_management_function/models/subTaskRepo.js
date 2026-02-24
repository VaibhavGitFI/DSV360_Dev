"use strict";

const { TABLE_STORY_SUBTASKS } = require("../utils/constants");

function escapeZcqlString(value) {
  return String(value ?? "").replace(/'/g, "''");
}

function unwrap(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => {
    const k = Object.keys(r || {});
    return k.length === 1 && typeof r[k[0]] === "object" ? r[k[0]] : r;
  });
}

async function list(zcql, { orgId, taskId }) {
  const org = escapeZcqlString(orgId);

  const where = [
    `OrgID='${org}'`,
    `(IsDeleted IS NULL OR IsDeleted=0 OR IsDeleted='0')`,
  ];

  if (taskId) where.push(`TaskID='${escapeZcqlString(taskId)}'`);

  const query = `
    SELECT ROWID, OrgID, ProjectID, TaskID, StoryID, Title, Description, Status, EstimatedHours, AssigneeID, DueDate, IsDeleted, CREATEDTIME, MODIFIEDTIME
    FROM ${TABLE_STORY_SUBTASKS}
    WHERE ${where.join(" AND ")}
    ORDER BY CREATEDTIME ASC
  `;

  return await zcql.executeZCQLQuery(query);
}

async function listByTaskIds(zcql, { orgId, taskIds }) {
  if (!taskIds || taskIds.length === 0) return [];
  const org = escapeZcqlString(orgId);
  const ids = taskIds.map((id) => `'${escapeZcqlString(id)}'`).join(",");

  const query = `
    SELECT ROWID, OrgID, ProjectID, TaskID, StoryID, Title, Description, Status, EstimatedHours, AssigneeID, DueDate, IsDeleted, CREATEDTIME, MODIFIEDTIME
    FROM ${TABLE_STORY_SUBTASKS}
    WHERE OrgID='${org}' AND TaskID IN (${ids}) AND (IsDeleted IS NULL OR IsDeleted=0 OR IsDeleted='0')
    ORDER BY CREATEDTIME ASC
  `;

  return await zcql.executeZCQLQuery(query);
}

async function listByStoryIds(zcql, { orgId, storyIds }) {
  if (!storyIds || storyIds.length === 0) return [];
  const org = escapeZcqlString(orgId);
  const ids = storyIds.map((id) => `'${escapeZcqlString(id)}'`).join(",");

  const query = `
    SELECT ROWID, OrgID, ProjectID, TaskID, StoryID, Title, Description, Status, EstimatedHours, AssigneeID, DueDate, IsDeleted, CREATEDTIME, MODIFIEDTIME
    FROM ${TABLE_STORY_SUBTASKS}
    WHERE OrgID='${org}' AND StoryID IN (${ids}) AND (IsDeleted IS NULL OR IsDeleted=0 OR IsDeleted='0')
    ORDER BY CREATEDTIME ASC
  `;

  return await zcql.executeZCQLQuery(query);
}

async function insert(datastore, row) {
  return await datastore.table(TABLE_STORY_SUBTASKS).insertRow(row);
}

async function update(datastore, rowid, patch) {
  return await datastore.table(TABLE_STORY_SUBTASKS).updateRow({
    ROWID: rowid,
    ...patch,
  });
}

async function softDelete(datastore, { orgId, id }) {
  return await datastore.table(TABLE_STORY_SUBTASKS).updateRow({
    ROWID: id,
    OrgID: orgId,
    IsDeleted: 1,
  });
}

module.exports = { list, listByTaskIds, listByStoryIds, insert, update, softDelete, unwrap };
