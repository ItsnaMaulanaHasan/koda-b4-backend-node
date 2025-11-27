import {
  getDetailUser,
  getListUsers,
  getTotalDataUsers,
} from "../models/users.model";

/**
 * GET /admin/users
 * @summary Get list all of users
 * @tags admin/users
 * @param  {string} search.query     - search by name of users
 * @param  {number} page.query       - page of list users
 * @param  {number} limit.query      - limit of list users per page
 * @return {object} 200 - success get list all of users
 */
export async function listUsers(req, res) {
  try {
    const { search = "" } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const totalData = await getTotalDataUsers(search);
    const listUsers = await getListUsers(search, page, limit);

    res.json({
      success: true,
      message: "Success get list users",
      results: {
        data: listUsers,
        meta: {
          page,
          limit,
          totalData,
          totalPage: Math.ceil(totalData / limit),
        },
      },
    });
  } catch (err) {
    res.json({
      success: false,
      message: "Failed to get list users",
      error: err.message,
    });
  }
}

/**
 * GET /admin/users/{id}
 * @summary Get detail user by id
 * @tags admin/users
 * @param {number} id.path - id user
 * @return {object} 200 - Success get detail of user
 * @return {object} 404 - User not found
 */
export async function detailUser(req, res) {
  try {
    const { id } = req.params;
    const user = await getDetailUser(Number(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Success get detail user",
      results: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get detail user",
      error: err.message,
    });
  }
}

export async function createUser(req, res) {}

export async function updateUser(req, res) {}

export async function deleteUser(req, res) {}
