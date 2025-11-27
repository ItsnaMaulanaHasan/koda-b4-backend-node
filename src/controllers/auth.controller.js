/**
 * POST /auth/login
 * @summary Login user
 * @tags authentication
 * @param  {string} email.form.required - Email of user - application/x-www-form-urlencoded
 * @param  {string} password.form.required - Password of user - application/x-www-form-urlencoded
 * @return {object} 200 - login success
 * @return {object} 401 - wrong email or password
 */
export async function login(req, res) {}

/**
 * POST /auth/register
 * @summary Register user
 * @tags authentication
 * @param  {string} fullName.form.required - fullname of user - application/x-www-form-urlencoded
 * @param  {string} email.form.required - Email of user - application/x-www-form-urlencoded
 * @param  {string} password.form.required - Password of user - application/x-www-form-urlencoded
 * @return {object} 200 - login success
 */
export async function register(req, res) {}

/**
 * POST /auth/logout
 * @summary Logout user
 * @tags authentication
 * @return {object} 200 - logout success
 */
export async function logout(req, res) {}
