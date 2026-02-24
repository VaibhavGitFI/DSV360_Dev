"use strict";

const { TABLE_STORY_TASKS } = require("../utils/constants");

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

async function list(zcql, { orgId, storyId, projectId }) {
  const org = escapeZcqlString(orgId);

  const where = [
    `OrgID='${org}'`,
    `(IsDeleted IS NULL OR IsDeleted=0 OR IsDeleted='0')`,
  ];

  if (storyId) where.push(`StoryID='${escapeZcqlString(storyId)}'`);
  if (projectId) where.push(`ProjectID='${escapeZcqlString(projectId)}'`);

  const query = `
    SELECT ROWID, OrgID, ProjectID, StoryID, Title, Description, Status, EstimatedHours, AssigneeID, DueDate, IsDeleted, CREATEDTIME, MODIFIEDTIME
    FROM ${TABLE_STORY_TASKS}
    WHERE ${where.join(" AND ")}
    ORDER BY CREATEDTIME ASC
  `;

  return await zcql.executeZCQLQuery(query);
}

async function listByStoryIds(zcql, { orgId, storyIds }) {
  if (!storyIds || storyIds.length === 0) return [];
  const org = escapeZcqlString(orgId);
  const ids = storyIds.map((id) => `'${escapeZcqlString(id)}'`).join(",");

  const query = `
    SELECT ROWID, OrgID, ProjectID, StoryID, Title, Description, Status, EstimatedHours, AssigneeID, DueDate, IsDeleted, CREATEDTIME, MODIFIEDTIME
    FROM ${TABLE_STORY_TASKS}
    WHERE OrgID='${org}' AND StoryID IN (${ids}) AND (IsDeleted IS NULL OR IsDeleted=0 OR IsDeleted='0')
    ORDER BY CREATEDTIME ASC
  `;

  return await zcql.executeZCQLQuery(query);
}

async function getById(zcql, { orgId, id }) {
  const query = `
    SELECT ROWID, OrgID, ProjectID, StoryID, Title, Description, Status, EstimatedHours, AssigneeID, DueDate, IsDeleted, CREATEDTIME, MODIFIEDTIME
    FROM ${TABLE_STORY_TASKS}
    WHERE OrgID='${escapeZcqlString(orgId)}' AND ROWID='${escapeZcqlString(id)}' AND (IsDeleted IS NULL OR IsDeleted=0 OR IsDeleted='0')
    LIMIT 1
  `;
  return await zcql.executeZCQLQuery(query);
}

async function insert(datastore, row) {
  return await datastore.table(TABLE_STORY_TASKS).insertRow(row);
}

async function update(datastore, rowid, patch) {
  return await datastore.table(TABLE_STORY_TASKS).updateRow({
    ROWID: rowid,
    ...patch,
  });
}

async function softDelete(datastore, { orgId, id }) {
  return await datastore.table(TABLE_STORY_TASKS).updateRow({
    ROWID: id,
    OrgID: orgId,
    IsDeleted: 1,
  });
}

module.exports = { list, listByStoryIds, getById, insert, update, softDelete, unwrap };
