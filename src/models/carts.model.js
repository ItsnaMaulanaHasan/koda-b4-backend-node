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

export async function addToCart(bodyAdd) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: bodyAdd.productId },
        select: {
          stock: true,
          price: true,
          discountPercent: true,
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (bodyAdd.amount <= 0) {
        throw new Error("Invalid amount, must be greater than 0");
      }

      if (bodyAdd.amount > product.stock) {
        throw new Error("Amount exceeds available stock");
      }

      const size = await tx.size.findUnique({
        where: { id: bodyAdd.sizeId },
        select: { sizeCost: true },
      });

      const variant = await tx.variant.findUnique({
        where: { id: bodyAdd.variantId },
        select: { variantCost: true },
      });

      if (!size || !variant) {
        throw new Error("Size or variant not found");
      }

      const discountPercent = product.discountPercent || 0;
      const discountedPrice = product.price * (1 - discountPercent / 100);

      const pricePerItem =
        discountedPrice + size.sizeCost + variant.variantCost;
      const subtotal = pricePerItem * bodyAdd.amount;

      const existingCart = await tx.cart.findFirst({
        where: {
          userId: bodyAdd.userId,
          productId: bodyAdd.productId,
          sizeId: bodyAdd.sizeId,
          variantId: bodyAdd.variantId,
        },
      });

      if (existingCart) {
        const newAmount = existingCart.amount + bodyAdd.amount;
        const newSubtotal = pricePerItem * newAmount;

        const updatedCart = await tx.cart.update({
          where: { id: existingCart.id },
          data: {
            amount: newAmount,
            subtotal: newSubtotal,
            updatedBy: bodyAdd.userId,
          },
          select: {
            id: true,
            userId: true,
            productId: true,
            sizeId: true,
            variantId: true,
            amount: true,
            subtotal: true,
          },
        });

        return updatedCart;
      } else {
        const newCart = await tx.cart.create({
          data: {
            userId: bodyAdd.userId,
            productId: bodyAdd.productId,
            sizeId: bodyAdd.sizeId,
            variantId: bodyAdd.variantId,
            amount: bodyAdd.amount,
            subtotal: subtotal,
            createdBy: bodyAdd.userId,
            updatedBy: bodyAdd.userId,
          },
          select: {
            id: true,
            userId: true,
            productId: true,
            sizeId: true,
            variantId: true,
            amount: true,
            subtotal: true,
          },
        });

        return newCart;
      }
    });

    return result;
  } catch (err) {
    console.error("Error while adding to cart:", err);
    throw err;
  }
}
