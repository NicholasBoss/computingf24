// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const util = require("../utilities")
const accountValidator = require("../utilities/accountValidation")


// Routes

// Default Account Route
router.get("/", util.checkLogin, util.handleErrors(accountController.buildAccountManagement))

// Login Route
router.get("/login", util.handleErrors(accountController.buildLogin))

// Register Route
router.get("/register", util.handleErrors(accountController.buildRegister))

// Register Account Route
router.post("/register", 
    accountValidator.registrationRules(),
    accountValidator.checkRegData,
    util.handleErrors(accountController.registerAccount))

// Process Login Route
router.post("/login", 
    accountValidator.loginRules(),
    accountValidator.checkLoginData,
    util.handleErrors(accountController.accountLogin))

// Logout Route
router.get('/logout', accountController.accountLogout)

// Update Account Route
router.post('/update', util.checkLogin, util.handleErrors(accountController.updateAccount))

// Export
module.exports = router