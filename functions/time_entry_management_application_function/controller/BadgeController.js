"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const os = require("os");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
require("dotenv").config();

const catalyst = require("zcatalyst-sdk-node");
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const env = process.env.CATALYST_USER_ENVIRONMENT;

app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

const getAllBadges = async (req, res) => {
    try {
        const catalystApp = req.catalystApp;
        const query = "SELECT * FROM Badges";
        const response = await catalystApp.zcql().executeZCQLQuery(query);
        const filterResponse=response.map((item)=>{
            return item.Badges;
        })

        res.status(200).json({
            success: true,
            message: "All badges fetched successfully",
            data: filterResponse,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getBadgeById = async (req, res) => {
    try {
        const catalystApp = req.catalystApp;
        const id = parseInt(req.params.id);

        const query = `SELECT * FROM Badges WHERE ROWID = '${id}'`;
        console.log(query)
        const response = await catalystApp.zcql().executeZCQLQuery(query);

        if (response.length === 0) {
            return res.status(201).json({ success: false, message: "Badge not found" });
        }

        res.status(200).json({
            success: true,
            message: "Badge fetched successfully",
            data: response[0].Badges,
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getBadgeByUserId = async (req, res) => {
    try {
        const catalystApp = req.catalystApp;
        const id = req.params.id;
        const query = `SELECT * FROM Badge_Assign WHERE UserID = '${id}'`;
        console.log(query)
        const response = await catalystApp.zcql().executeZCQLQuery(query);

        if (response.length === 0) {
            return res.status(200).json({ success: false, message: "Badge not found" });
        }

        const filterData=response.map((item)=>{
            return item.Badge_Assign;
        })

        res.status(200).json({
            success: true,
            message: "Badge fetched successfully",
            data: filterData,
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const createBadge = async (req, res) => {
    try {
        const catalystApp = req.catalystApp;
        const datastore = catalystApp.datastore();
        const Badges = datastore.table("Badges");

        const badgeData = req.body;
        const inserted = await Badges.insertRow(badgeData);

        res.status(201).json({
            success: true,
            message: "Badge created successfully",
            data: inserted,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateBadge = async (req, res) => {
    try {
        const catalystApp = req.catalystApp;
        const id = req.params.id;
        const datastore = catalystApp.datastore();
        const Badges = datastore.table("Badges");

        const updatedData = req.body;
        updatedData.ROWID = id;



        const query=`SELECT ROWID FROM Badges WHERE ROWID='${id}'`;
        const response=await catalystApp.zcql().executeZCQLQuery(query);

        if(response && response.length==0){
            res.status(500).json({ success: false, error: `No record found with ${id}` });
        }

        const updated = await Badges.updateRow(updatedData); 

        res.status(200).json({
            success: true,
            message: "Badge updated successfully",
            data: updated,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteBadge = async (req, res) => {
    try {
        const catalystApp = req.catalystApp;
        const id = req.params.id;
        const datastore = catalystApp.datastore();
        const Badges = datastore.table("Badges");

        await Badges.deleteRow(id);

        res.status(200).json({
            success: true,
            message: "Badge deleted successfully",
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const assignBadge = async (req, res) => {
    try {
        const catalystApp = req.catalystApp;
        const datastore = catalystApp.datastore();
        const Badge_Assign_Table = datastore.table("Badge_Assign");
        const assignData = req.body;

        const userID = assignData.UserID;
        const badgeID = assignData.BadgeRowID;
        const query = `SELECT * FROM Badge_Assign WHERE UserID = '${userID}' AND BadgeRowID = '${badgeID}'`;
        const assigned = await catalystApp.zcql().executeZCQLQuery(query);

        if (assigned && assigned.length > 0) {
            return res.status(200).json({
                success: false,
                message: "Badge already assigned"
            });
        }

        const inserted = await Badge_Assign_Table.insertRow(assignData);

        res.status(201).json({
            success: true,
            message: "Badge assigned successfully",
            data: inserted,
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An error occurred while assigning badge",
            error: err.message,
        });
    }
};

const deleteBadgeAssignments = async (req, res) => {
    try {
        const catalystApp = req.catalystApp;
        const datastore = catalystApp.datastore();
        const Badge_Assign_Table = datastore.table("Badge_Assign");

        const rowIDs = req.body.rowIDs;

        if (!Array.isArray(rowIDs) || rowIDs.length === 0) {
            return res.status(400).json({
                success: false,
                message: "rowIDs must be a non-empty array",
            });
        }

        // Run deletions in parallel
        await Promise.all(
            rowIDs.map(rowID => Badge_Assign_Table.deleteRow(rowID))
        );

        res.status(200).json({
            success: true,
            message: "Badge assignments deleted successfully",
            deleted: rowIDs,
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting badge assignments",
            error: err.message,
        });
    }
};

module.exports = {
    getAllBadges,
    getBadgeById,
    getBadgeByUserId,
    createBadge,
    updateBadge,
    deleteBadge,
    assignBadge,
    deleteBadgeAssignments
};
