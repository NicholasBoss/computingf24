// Needed Resources 
const express = require("express")
const router = new express.Router() 
const teamController = require("../controllers/teamController")
const util = require("../utilities")

// Routes

// Default Team Route
router.get("/wdd", util.handleErrors(teamController.buildWdd))
router.get("/gamedev", util.handleErrors(teamController.buildGamedev))
router.get("/swe", util.handleErrors(teamController.buildSWE))
router.get("/cloudsoluation", util.handleErrors(teamController.cloudsoluation))
router.get("/dataSciAi", util.handleErrors(teamController.builddataSciAi))
// Export
module.exports = router