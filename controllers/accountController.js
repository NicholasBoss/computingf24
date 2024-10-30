const accountModel = require('../models/accountModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { link } = require('../routes/static')
const e = require('connect-flash')
const env = require("dotenv").config()
require('dotenv').config()


/* ***********************
 * Build Login Form
 *************************/
async function buildLogin(req, res){
    // console.log('Building Login Form')
    // Get url that user was trying to access from the checkLogin middleware unless user navigated to login page or register page
    // if user was redirected, set the url using req.session.redirectTo, else set url to account home
    let url
    if (req.session.redirectTo) {
        url = req.session.redirectTo
        delete req.session.redirectTo
    } else {
        url = '/account/'
    } 
    console.log('PAGE REDIRECT URL:', url)  
    res.render("account/login", {
        title: "Login",
        link: "login",
        section: "account",
        errors: null,
        url
    })
}

/* ***********************
 * Build Register Form
 *************************/
async function buildRegister(req, res) {
    res.render("account/register", {
        title: "Register",
        link: "register",
        section: "account",
        errors: null
    })
}

/* ***********************
 * Register User
 *************************/
async function registerAccount(req, res){
    // console.log('Registering account')
    const { account_firstname, account_lastname, account_email, account_phone, account_password } = req.body
    // console.log('Account First Name:', account_firstname)
    // console.log('Account Last Name:', account_lastname)
    // console.log('Account Email:', account_email)
    // console.log('Account Phone:', account_phone)
    let hashedPassword
    try {
        console.log('Creating account')
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
        console.log('Error creating account')
        res.render("account/register", {
            title: "Register",
            link: "register",
            section: "account",
            errors: error.errors
        })
    }

    const regResult = await accountModel.createAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_phone,
        hashedPassword,
    )

    if (regResult) {
        req.flash(
            'notice', 
            `Congratulations, you\'re now registered ${account_firstname}. Please log in.`
        )
        res.status(201).render('account/login', {
            title: 'Login',
            link: 'account/login',
            section: 'account',
            errors: null,
            url: '/account/register'
        })
    } else {
        req.flash(
            'notice', 
            `Sorry the registration failed.`
        )
        res.status(501).render('/register', {
            title: 'Register',
            link: 'register',
            section: 'account',
            errors: null,
        })
    }
}

/* *********************
 * Process Login
************************/
async function accountLogin(req, res){
    const { account_email, account_password, url } = req.body
    // console.log('URL:', url)
    const accountData = await accountModel.getAccountByEmail(account_email)
    // console.log("Account Data")
    // console.log(accountData)
    if (!accountData) {
        req.flash('notice', 'Please check your credentials and try again.')
        res.status(400).render('account/login', {
            title: 'Login',
            link: 'account/login',
            section: 'account',
            errors: null,
            account_email,
            url
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)){
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 3600})
            if(process.env.NODE_ENV === 'development'){
                res.cookie('jwt', accessToken, {httpOnly: true, maxAge: 3600 * 1000})
        } else {
            res.cookie('jwt', accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000})
        }
        
        const newUrl = url
        // console.log('URL:', url)
        if (newUrl == '/account/login' || newUrl == '/account/register') {
            res.redirect('/account/')
        } else {
            res.redirect(newUrl)
        }
    } else {
        req.flash('notice', 'Please check your credentials and try again.')
        res.status(400).render('account/login', {
            title: 'Login',
            link: 'account/login',
            section: 'account',
            errors: null,
            account_email,
            url
        })
    
    }
} catch (error) {
    return new Error('Access Forbidden')
}
}

/* *******************************
 * Process Logout
*********************************/
async function accountLogout(req, res){
    res.clearCookie('jwt')
    req.flash('notice', 'You have been logged out.')
    res.redirect('/')
}

/* *******************************
 * Build Account Home
*********************************/
async function buildAccountManagement(req, res){
    const account_id = res.locals.accountData.account_id
    
    res.render('account/myAccount', {
        title: 'Account Home',
        link: 'account',
        section: 'account',
        accountData: res.locals.accountData,
        errors: null,
    })
}

/* *******************************
 * Build Update Account View
*********************************/
async function buildUpdateAccount(req, res){
    // console.log("Building Update Account View")
    // const nav = await utilities.getNav()
    // console.log(res.locals.accountData)
    res.render('account/updateAccount', {
        title: 'Update Account Information', 
        link: 'account/update',
        section: 'account',
        errors: null,
        account_firstname: res.locals.accountData.account_firstname,
        account_lastname: res.locals.accountData.account_lastname,
        account_email: res.locals.accountData.account_email,
        account_id: res.locals.accountData.account_id
    })
}

/* *******************************
 * Process Update Account
*********************************/
async function updateAccount(req, res){
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email )
    if (updateResult) {
        const accountData = await accountModel.getAccountById(account_id)
        // delete the token
        res.clearCookie('jwt')
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 3600})
        if(process.env.NODE_ENV === 'development'){
            res.cookie('jwt', accessToken, {httpOnly: true, maxAge: 3600 * 1000})
        } else {
            res.cookie('jwt', accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000})
        }
        req.flash('notice', 'Your account information has been updated.')
        res.redirect('/account/')
    } else {
        req.flash('notice', 'Sorry, there was an error updating your account information.')
        res.redirect('/account/update')
    }
}

/* *******************************
 * Update Account Password
*********************************/
async function updatePassword(req, res){
    // console.log("Updating Password View")
    const { account_id, account_password } = req.body
    // console.log("Account Id: ", account_id)
    // console.log("Account Password: ", account_password)
    let hashedPassword
    try {
        //regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error encrypting your password.')
        res.status(500).render('/account/updateAccount', {
            title: 'Update Account Information',
            link: 'account/updateAccount',
            section: 'account',
            errors: null,
        })
    }
        // update the password
        // console.log('Updating Password')
        const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
        if (updateResult) {
            req.flash('notice', 'Your password has been updated.')
            res.redirect('/account/')
        } else {
            req.flash('notice', 'Sorry, there was an error updating your password.')
            res.redirect('/account/updateAccount')
        }
    }

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    accountLogout,
    buildAccountManagement,
    buildUpdateAccount,
    updateAccount,
    updatePassword
}