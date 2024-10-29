const pool = require('../database/')

/* ***********************
    * Create Account
    *************************/
async function createAccount(account_firstname, account_lastname, account_email, account_phone, account_password) {
    try {
        const sql = 'INSERT INTO account (account_firstname, account_lastname, account_email, account_phone, account_password) VALUES ($1, $2, $3, $4, $5) RETURNING *'
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_phone, account_password])
    } catch (error) {
        return error.message
    }
}

/* ***********************
    * Check Existing Email
    *************************/
async function checkExistingEmail(account_email) {
    try {
        const sql = 'SELECT account_email FROM account WHERE account_email = $1'
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

/* ***************************
 * Return account data using email address
***************************** */
async function getAccountByEmail(account_email){
    // console.log('Getting account by email:', account_email)
    try {
        const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_phone, account_email, account_type, account_password FROM account WHERE account_email = $1', 
        [account_email])
        // console.log('Result:',result)
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}

/* ***************************
  * Return account data using account ID
***************************** */
async function getAccountById(account_id){
    try {
      const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1', 
        [account_id])
        return result.rows[0]
    } catch (error) {
      return new Error("No matching account found")
    }
  }

/* *******************
 *  Update account info
********************* */
async function updateAccount(account_id, account_firstname, account_lastname, account_email){
    console.log("Updating Account")
    // console.log("Account ID: ", account_id)
    // console.log("First Name: ", account_firstname)
    // console.log("Last Name: ", account_lastname)
    // console.log("Email: ", account_email)
    try {
        const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    } catch (error) {
        return error.message
    }
}

  /* *******************
   * Update account password
  ********************* */
async function updatePassword(account_id, account_password){
    try {
        const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2"
        return await pool.query(sql, [account_password, account_id])
    } catch (error) {
        return error.message
    }
}

module.exports = {
    createAccount,
    checkExistingEmail,
    getAccountByEmail,
    getAccountById,
    updateAccount,
    updatePassword
}