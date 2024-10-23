// Needed Resources 
const express = require("express")
const router = new express.Router() 
const teamController = require("../controllers/teamController")
const util = require("../utilities")

// Routes

// Default Team Route
router.get("/wdd", util.handleErrors(teamController.buildWdd))

// Export
module.exports = router