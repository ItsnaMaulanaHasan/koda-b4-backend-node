import {
  checkTransactionExists,
  getDetailTransaction,
  getListAllTransactions,
  getTotalDataTransactions,
  getTransactionItems,
  updateTransactionStatusById,
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
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    const transactionItems = await getTransactionItems(id);

    transaction.transactionItems = transactionItems;

    res.status(200).json({
      success: true,
      message: "Success get transaction detail",
      data: transaction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get detail transaction",
      error: err.message,
    });
  }
}

/**
 * @openapi
 * /admin/transactions/{id}:
 *   patch:
 *     summary: Update transaction status
 *     tags:
 *       - admin/transactions
 *     security:
 *       - BearerAuth: []
 *     description: Updating transaction status based on Id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Transaction Id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - statusId
 *             properties:
 *               statusId:
 *                 type: integer
 *                 description: Transaction status (1=On Progress, 2=Sending Goods, 3=Finish Order)
 *                 example: 2
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statusId
 *             properties:
 *               statusId:
 *                 type: integer
 *                 description: Transaction status (1=On Progress, 2=Sending Goods, 3=Finish Order)
 *                 example: 2
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 *       400:
 *         description: Invalid Id format or invalid request body
 *       401:
 *         description: User Id not found in token
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error while updating transaction status
 */
export async function updateStatusTransaction(req, res) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid Id format",
      });
      return;
    }

    const statusId = Number(req.body.statusId);

    if (!statusId || isNaN(statusId)) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User Id not found in token",
      });
      return;
    }

    const isExists = await checkTransactionExists(id);
    if (!isExists) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    const result = await updateTransactionStatusById(id, statusId, userId);

    res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update status transaction",
      error: err.message,
    });
  }
}

export async function checkout() {}
