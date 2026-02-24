"use strict";

const { TABLE_EPICS } = require("../utils/constants");

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

  const where = [
    `OrgID='${org}'`,
    `(IsDeleted IS NULL OR IsDeleted=0 OR IsDeleted='0')`,
  ];
  if (proj) where.push(`ProjectID='${proj}'`);

  const query = `
    SELECT ROWID, OrgID, ProjectID, MilestoneID, Title, Description, Color, IsDeleted, CREATEDTIME, MODIFIEDTIME
    FROM ${TABLE_EPICS}
    WHERE ${where.join(" AND ")}
    ORDER BY CREATEDTIME ASC
  `;

  return await zcql.executeZCQLQuery(query);
}

async function insert(datastore, row) {
  return await datastore.table(TABLE_EPICS).insertRow(row);
}

async function update(datastore, rowid, patch) {
  return await datastore.table(TABLE_EPICS).updateRow({
    ROWID: rowid,
    ...patch,
  });
}

async function softDelete(datastore, { orgId, id }) {
  return await datastore.table(TABLE_EPICS).updateRow({
    ROWID: id,
    OrgID: orgId,
    IsDeleted: 1,
  });
}

module.exports = { list, insert, update, softDelete, unwrap };
