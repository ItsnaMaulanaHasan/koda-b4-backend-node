import { prisma } from "../lib/prisma.js";

export async function getListCart(userId) {
  try {
    const carts = await prisma.cart.findMany({
      where: { userId: userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        userId: true,
        productId: true,
        amount: true,
        subtotal: true,
        product: {
          select: {
            name: true,
            price: true,
            isFlashSale: true,
            discountPercent: true,
            productImages: {
              where: { isPrimary: true },
              select: { productImage: true },
              take: 1,
            },
          },
        },
        size: {
          select: {
            name: true,
            sizeCost: true,
          },
        },
        variant: {
          select: {
            name: true,
            variantCost: true,
          },
        },
      },
    });

    const formattedCarts = carts.map((cart) => ({
      id: cart.id,
      userId: cart.userId,
      productId: cart.productId,
      productImage:
        cart.product.productImages.length > 0
          ? cart.product.productImages[0].productImage
          : "",
      productName: cart.product.name,
      productPrice: cart.product.price,
      isFlashSale: cart.product.isFlashSale,
      discountPercent: cart.product.discountPercent || 0,
      discountPrice:
        cart.product.discountPercent && cart.product.discountPercent > 0
          ? cart.product.price * (1 - cart.product.discountPercent / 100)
          : 0,
      sizeName: cart.size?.name || "",
      sizeCost: cart.size?.sizeCost || 0,
      variantName: cart.variant?.name || "",
      variantCost: cart.variant?.variantCost || 0,
      amount: cart.amount,
      subtotal: cart.subtotal,
    }));

    return formattedCarts;
  } catch (err) {
    console.error("Error while fetching carts:", err);
    throw err;
  }
}
