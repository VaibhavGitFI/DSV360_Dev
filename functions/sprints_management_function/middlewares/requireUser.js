"use strict";

module.exports.requireUser = async (req, res, next) => {
  try {
    const userManagement = req.catalystApp.userManagement();
    const user = await userManagement.getCurrentUser();

    // Catalyst sometimes returns null instead of throwing
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Attach user to request
    req.user = user;

    // Optional: normalize org/user ids (safe, additive)
    req.userContext = {
      userId:
        user.user_id || user.userId || user.zuid || user.ZUID || null,
      orgId:
        user.org_id || user.orgId || user.orgid || user.organization_id || null,
    };

    // If orgId missing, fail early (prevents 500s)
    if (!req.userContext.orgId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized (org not resolved)",
      });
    }

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};
