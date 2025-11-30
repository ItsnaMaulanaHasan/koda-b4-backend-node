import { buildHateoasPagination } from "../lib/hateoasBuilder.js";
import { getListAllSizes, getTotalDataSizes } from "../models/sizes.model.js";

/**
 * @openapi
 * /admin/sizes:
 *   get:
 *     summary: Get list sizes
 *     tags:
 *       - admin/sizes
 *     description: Retrieve list sizes data with pagination support
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword for size name
 *     responses:
 *       200:
 *         description: Successfully retrieved sizes list
 *       400:
 *         description: Invalid pagination parameters or page out of range
 *       500:
 *         description: Internal server error
 */
export async function listSizes(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'page' must be greater than 0",
      });
    }

    if (limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'limit' must be greater than 0",
      });
    }

    if (limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'limit' cannot exceed 100",
      });
    }

    const totalData = await getTotalDataSizes(search);

    const totalPages = Math.ceil(totalData / limit);

    if (page > totalPages && totalPages > 0) {
      return res.status(400).json({
        success: false,
        message: "Page is out of range",
      });
    }

    const sizes = await getListAllSizes(page, limit, search);

    const links = buildHateoasPagination(req, page, limit, totalData);

    return res.status(200).json({
      success: true,
      message: "Success get all sizes",
      result: sizes,
      _links: links,
      meta: {
        currentPage: page,
        perPage: limit,
        totalData: totalData,
        totalPages: totalPages,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sizes",
      error: err.message,
    });
  }
}
