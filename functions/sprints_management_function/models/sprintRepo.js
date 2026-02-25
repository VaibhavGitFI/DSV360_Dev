"use strict";

const TABLE = "Sprints";

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

async function list(zcql, { orgId, projectId }) {
  const org = escapeZcqlString(orgId);
  const proj = escapeZcqlString(projectId);

  const where = proj
    ? `WHERE OrgID='${org}' AND ProjectID='${proj}' AND (IsDeleted IS NULL OR IsDeleted='0' OR IsDeleted=0)`
    : `WHERE OrgID='${org}' AND (IsDeleted IS NULL OR IsDeleted='0' OR IsDeleted=0)`;

  const query = `
    SELECT ROWID, OrgID, ProjectID, SprintName, Goal, StartDate, EndDate, Status, IsDeleted, CREATEDTIME, MODIFIEDTIME
    FROM ${TABLE}
    ${where}
    ORDER BY CREATEDTIME DESC
  `;
  return await zcql.executeZCQLQuery(query);
}

async function getById(zcql, { orgId, id }) {
  const org = escapeZcqlString(orgId);
  const safeId = escapeZcqlString(id);

  const query = `
    SELECT ROWID, OrgID, ProjectID, SprintName, Goal, StartDate, EndDate, Status, IsDeleted, CREATEDTIME, MODIFIEDTIME
    FROM ${TABLE}
    WHERE OrgID='${org}' AND ROWID='${safeId}' AND (IsDeleted IS NULL OR IsDeleted='0' OR IsDeleted=0)
    LIMIT 1
  `;
  return await zcql.executeZCQLQuery(query);
}

async function insert(datastore, row) {
  return await datastore.table(TABLE).insertRow(row);
}

async function softDelete(datastore, { orgId, id }) {
  // Catalyst needs ROWID for updateRow
  return await datastore.table(TABLE).updateRow({
    ROWID: id,
    OrgID: orgId, // keep org guard columns same
    IsDeleted: 1,
  });
}

async function update(datastore, rowid, patch) {
  return await datastore.table(TABLE).updateRow({
    ROWID: rowid,
    ...patch,
  });
}

module.exports = { list, getById, insert, update, softDelete, unwrap };
