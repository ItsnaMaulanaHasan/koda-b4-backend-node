import { buildHateoasPagination } from "../lib/hateoasBuilder.js";
import {
  getListAllVariants,
  getTotalDataVariants,
} from "../models/variants.model.js";

/**
 * @openapi
 * /admin/variants:
 *   get:
 *     summary: Get list variants
 *     tags:
 *       - admin/variants
 *     description: Retrieve list variants data with pagination support
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
 *         description: Search keyword for variant name
 *     responses:
 *       200:
 *         description: Successfully retrieved variants list
 *       400:
 *         description: Invalid pagination parameters or page out of range
 *       500:
 *         description: Internal server error
 */
export async function listVariants(req, res) {
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

    const totalData = await getTotalDataVariants(search);

    const totalPages = Math.ceil(totalData / limit);

    if (page > totalPages && totalPages > 0) {
      return res.status(400).json({
        success: false,
        message: "Page is out of range",
      });
    }

    const variants = await getListAllVariants(page, limit, search);

    const links = buildHateoasPagination(req, page, limit, totalData);

    return res.status(200).json({
      success: true,
      message: "Success get all variants",
      result: variants,
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
      message: "Failed to fetch variants",
      error: err.message,
    });
  }
}
