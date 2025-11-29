import {
  getDetailTransaction,
  getListAllTransactions,
  getTotalDataTransactions,
  getTransactionItems,
} from "../models/transactions.model.js";

/**
 * @openapi
 * /admin/transactions:
 *   get:
 *     summary: Get list transactions
 *     tags:
 *       - admin/transactions
 *     security:
 *       - BearerAuth: []
 *     description: Retrieving list transactions with pagination support, search, and status filter
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: search
 *         in: query
 *         description: Search value for invoice number
 *         required: false
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Filter by transaction status
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved transaction list
 *       400:
 *         description: Invalid pagination parameters or page out of range
 *       500:
 *         description: Internal server error while fetching or processing transaction data
 */
export async function listTransactions(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    if (page < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'page' must be greater than 0",
      });
      return;
    }

    if (limit < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'limit' must be greater than 0",
      });
      return;
    }

    if (limit > 100) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'limit' cannot exceed 100",
      });
      return;
    }

    const totalData = await getTotalDataTransactions(search, status);

    const totalPages = Math.ceil(totalData / limit);

    if (page > totalPages && totalPages > 0) {
      res.status(400).json({
        success: false,
        message: "Page is out of range",
      });
      return;
    }

    const transactions = await getListAllTransactions(
      page,
      limit,
      search,
      status
    );

    res.status(200).json({
      success: true,
      message: "Success get all transaction",
      data: transactions,
      meta: {
        currentPage: page,
        perPage: limit,
        totalData: totalData,
        totalPages: totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get list transactions",
      error: err.message,
    });
  }
}

/**
 * @openapi
 * /admin/transactions/{id}:
 *   get:
 *     summary: Get transaction by Id
 *     tags:
 *       - admin/transactions
 *     security:
 *       - BearerAuth: []
 *     description: Retrieving transaction detail data based on Id including transaction items
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Transaction Id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved transaction detail
 *       400:
 *         description: Invalid Id format
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error while fetching transaction from database
 */
export async function detailTransaction(req, res) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid Id format",
      });
      return;
    }

    const transaction = await getDetailTransaction(id);
    const transactionItems = await getTransactionItems(id);

    transaction.transactionItems = transactionItems;

    res.status(200).json({
      success: true,
      message: "Success get transaction detail",
      data: transaction,
    });
  } catch (err) {
    const statusCode = err.message === "Transaction not found" ? 404 : 500;
    const message =
      err.message === "Transaction not found"
        ? "Transaction not found"
        : "Failed to fetch transaction from database";

    res.status(statusCode).json({
      success: false,
      message: message,
      error: err.message,
    });
  }
}

export async function updateStatusTransaction() {}
