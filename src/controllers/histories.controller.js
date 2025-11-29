import {
  getDetailHistory,
  getListHistories,
} from "../models/histories.model.js";

/**
 * @openapi
 * /histories:
 *   get:
 *     summary: Get list histories
 *     tags:
 *       - histories
 *     security:
 *       - BearerAuth: []
 *     description: Retrieving list histories with pagination support
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
 *           maximum: 10
 *           default: 5
 *       - name: date
 *         in: query
 *         description: Date filter (format YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: 2024-01-15
 *       - name: statusid
 *         in: query
 *         description: Id of status
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved histories list
 *       400:
 *         description: Invalid pagination parameters or page out of range
 *       401:
 *         description: User Id not found in token
 *       500:
 *         description: Internal server error while fetching or processing history data
 */
export async function listHistories(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const date = req.query.date || "";
    const statusId = Number(req.query.statusid) || 1;

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

    if (limit > 10) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'limit' cannot exceed 10",
      });
      return;
    }

    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        res.status(400).json({
          success: false,
          message: "Invalid date format. Expected format: YYYY-MM-DD",
        });
        return;
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({
          success: false,
          message: "Invalid date format. Expected format: YYYY-MM-DD",
        });
        return;
      }
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User Id not found in token",
      });
      return;
    }

    const result = await getListHistories(userId, page, limit, date, statusId);

    const totalPages = Math.ceil(result.totalData / limit);

    if (page > totalPages && totalPages > 0) {
      res.status(400).json({
        success: false,
        message: "Page is out of range",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Successfully retrieved transaction histories",
      data: result.histories,
      meta: {
        currentPage: page,
        perPage: limit,
        totalData: result.totalData,
        totalPages: totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get list histories",
      error: err.message,
    });
  }
}

/**
 * @openapi
 * /histories/{noinvoice}:
 *   get:
 *     summary: Get detail history
 *     tags:
 *       - histories
 *     security:
 *       - BearerAuth: []
 *     description: Retrieving history detail data based on invoice number including transaction items
 *     parameters:
 *       - name: noinvoice
 *         in: path
 *         description: Invoice number
 *         required: true
 *         schema:
 *           type: string
 *           example: INV-2024-001
 *     responses:
 *       200:
 *         description: Successfully retrieved history detail
 *       404:
 *         description: History not found
 *       500:
 *         description: Internal server error while fetching history from database
 */
export async function detailHistory(req, res) {
  try {
    const noInvoice = req.params.noinvoice;

    if (!noInvoice) {
      res.status(400).json({
        success: false,
        message: "Invoice number is required",
      });
      return;
    }

    const historyDetail = await getDetailHistory(noInvoice);

    if (!historyDetail) {
      res.status(404).json({
        success: false,
        message: "History not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Success get transaction detail",
      data: historyDetail,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get detail history",
      error: err.message,
    });
  }
}
