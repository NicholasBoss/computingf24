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

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    accountLogout,
    buildAccountManagement,
}