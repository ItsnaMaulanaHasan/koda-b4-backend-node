import { getListFavouriteProducts } from "../models/products.model.js";

export async function favouriteProducts(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 4;

    if (limit < 1) {
      res.status(400).json({
        success: false,
        message: "Limit must be greater than 0",
      });
      return;
    }

    if (limit > 20) {
      res.status(400).json({
        success: false,
        message: "Limit cannot exceed 20",
      });
      return;
    }

    const products = await getListFavouriteProducts(limit);

    res.status(200).json({
      success: true,
      message: "Success get all favourite products",
      data: products,
      limit: limit,
    });
  } catch (err) {
    console.error("Error in listFavouriteProducts:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch favourite products from database",
      error: err.message,
    });
  }
}
