"use strict";

function getOrgId(user) {
  // Try common Catalyst keys safely
  return (
    user?.org_id ||
    user?.orgId ||
    user?.organization_id ||
    user?.organizationId ||
    user?.zaid || // fallback if some env uses zaid
    ""
  );
}

function getUserId(user) {
  return user?.user_id || user?.userId || user?.id || "";
}

module.exports = { getOrgId, getUserId };
