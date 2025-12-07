/* eslint-disable no-unused-vars */
import { prisma } from "../lib/prisma.js";

export async function getTotalDataTransactions(search, status) {
  try {
    const whereClause = {};

    if (search) {
      whereClause.noInvoice = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (status) {
      whereClause.status = {
        name: {
          equals: status,
          mode: "insensitive",
        },
      };
    }

    const totalData = await prisma.transaction.count({
      where: whereClause,
    });

    return totalData;
  } catch (err) {
    console.error("Error while counting transactions:", err);
    throw err;
  }
}

export async function getListAllTransactions(page, limit, search, status) {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause.noInvoice = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (status) {
      whereClause.status = {
        name: {
          equals: status,
          mode: "insensitive",
        },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: [{ dateTransaction: "desc" }, { id: "desc" }],
      select: {
        id: true,
        noInvoice: true,
        dateTransaction: true,
        totalTransaction: true,
        status: {
          select: {
            name: true,
          },
        },
        transactionItems: {
          select: {
            productName: true,
          },
          distinct: ["productName"],
        },
      },
    });

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      noInvoice: transaction.noInvoice,
      dateTransaction: transaction.dateTransaction,
      status: transaction.status.name,
      transactionItems: transaction.transactionItems.map(
        (item) => item.productName
      ),
      totalTransaction: Number(transaction.totalTransaction),
    }));

    return formattedTransactions;
  } catch (err) {
    console.error("Error while fetching transactions:", err);
    throw err;
  }
}

export async function getDetailTransaction(id) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: id },
      select: {
        id: true,
        userId: true,
        noInvoice: true,
        dateTransaction: true,
        fullName: true,
        email: true,
        address: true,
        phone: true,
        deliveryFee: true,
        adminFee: true,
        tax: true,
        totalTransaction: true,
        paymentMethod: {
          select: {
            name: true,
          },
        },
        orderMethod: {
          select: {
            name: true,
          },
        },
        status: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      return null;
    }

    const formattedTransaction = {
      id: transaction.id,
      userId: transaction.userId,
      noInvoice: transaction.noInvoice,
      dateTransaction: transaction.dateTransaction,
      fullName: transaction.fullName,
      email: transaction.email,
      address: transaction.address,
      phone: transaction.phone,
      paymentMethod: transaction.paymentMethod.name,
      orderMethod: transaction.orderMethod.name,
      status: transaction.status.name,
      deliveryFee: Number(transaction.deliveryFee),
      adminFee: Number(transaction.adminFee),
      tax: Number(transaction.tax),
      totalTransaction: Number(transaction.totalTransaction),
    };

    return formattedTransaction;
  } catch (err) {
    console.error("Error while fetching transaction detail:", err);
    throw err;
  }
}

export async function getTransactionItems(transactionId) {
  try {
    const transactionItems = await prisma.transactionItem.findMany({
      where: { transactionId: transactionId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        transactionId: true,
        productId: true,
        productName: true,
        productPrice: true,
        discountPercent: true,
        discountPrice: true,
        size: true,
        sizeCost: true,
        variant: true,
        variantCost: true,
        amount: true,
        subtotal: true,
      },
    });

    const formattedTransactionItems = transactionItems.map((item) => ({
      ...item,
      productPrice: Number(item.productPrice),
      discountPercent: Number(item.discountPercent),
      discountPrice: Number(item.discountPrice),
      sizeCost: Number(item.sizeCost),
      variantCost: Number(item.variantCost),
      amount: Number(item.amount),
      subtotal: Number(item.subtotal),
    }));

    return formattedTransactionItems;
  } catch (err) {
    console.error("Error while fetching transaction items:", err);
    throw err;
  }
}

export async function getTransactionById(id) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: id },
      select: {
        id: true,
        orderMethodId: true,
        statusId: true,
        orderMethod: {
          select: {
            id: true,
            name: true,
          },
        },
        status: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return transaction;
  } catch (err) {
    console.error("Error while getting transaction:", err);
    throw err;
  }
}

export function validateStatusTransition(orderMethodId, newStatusId) {
  const STATUS_ON_PROGRESS = 1;
  const STATUS_SENDING_GOODS = 2;
  const STATUS_FINISH_ORDER = 3;

  const ORDER_METHOD_DINE_IN = 1;
  const ORDER_METHOD_DOOR_DELIVERY = 2;
  const ORDER_METHOD_PICK_UP = 3;

  if (
    (orderMethodId === ORDER_METHOD_DINE_IN ||
      orderMethodId === ORDER_METHOD_PICK_UP) &&
    newStatusId === STATUS_SENDING_GOODS
  ) {
    return {
      isValid: false,
      message:
        orderMethodId === ORDER_METHOD_DINE_IN
          ? "Cannot set status to 'Sending Goods' for Dine In orders. Valid statuses are 'On Progress' or 'Finish Order'."
          : "Cannot set status to 'Sending Goods' for Pick Up orders. Valid statuses are 'On Progress' or 'Finish Order'.",
    };
  }

  return {
    isValid: true,
    message: "Status transition is valid",
  };
}

export async function checkTransactionExists(id) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: id },
      select: { id: true },
    });

    return !!transaction;
  } catch (err) {
    console.error("Error while checking transaction existence:", err);
    throw err;
  }
}

export async function updateTransactionStatusById(
  transactionId,
  statusId,
  userId
) {
  try {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        statusId: statusId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Transaction status updated successfully",
    };
  } catch (err) {
    console.error("Error while updating transaction status:", err);
    throw err;
  }
}

export async function getDeliveryFeeAndAdminFee(
  orderMethodId,
  paymentMethodId
) {
  try {
    const orderMethod = await prisma.orderMethod.findUnique({
      where: { id: orderMethodId },
      select: { deliveryFee: true },
    });

    if (!orderMethod) {
      throw new Error("Invalid order method id");
    }

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
      select: { adminFee: true },
    });

    if (!paymentMethod) {
      throw new Error("Invalid payment method id");
    }

    return {
      deliveryFee: Number(orderMethod.deliveryFee || 0),
      adminFee: Number(paymentMethod.adminFee || 0),
    };
  } catch (err) {
    console.error("Error while fetching fees:", err);
    throw err;
  }
}

export async function makeTransaction(userId, bodyCheckout, carts) {
  try {
    for (const cart of carts) {
      const product = await prisma.product.findUnique({
        where: { id: cart.productId },
        select: { stock: true, name: true },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (cart.amount > product.stock) {
        throw new Error(
          `Stock for product "${product.name}" is not enough. Available: ${product.stock}, requested: ${cart.amount}`
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: userId,
          noInvoice: bodyCheckout.noInvoice,
          dateTransaction: bodyCheckout.dateTransaction,
          fullName: bodyCheckout.fullName,
          email: bodyCheckout.email,
          address: bodyCheckout.address,
          phone: bodyCheckout.phone,
          paymentMethodId: bodyCheckout.paymentMethodId,
          orderMethodId: bodyCheckout.orderMethodId,
          statusId: 1,
          deliveryFee: bodyCheckout.deliveryFee,
          adminFee: bodyCheckout.adminFee,
          tax: bodyCheckout.tax,
          totalTransaction: bodyCheckout.totalTransaction,
          createdBy: userId,
          updatedBy: userId,
        },
        select: {
          id: true,
        },
      });

      for (const cart of carts) {
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: cart.productId,
            productName: cart.productName,
            productPrice: cart.productPrice,
            discountPercent: cart.discountPercent,
            discountPrice: cart.discountPrice,
            size: cart.sizeName,
            sizeCost: cart.sizeCost,
            variant: cart.variantName,
            variantCost: cart.variantCost,
            amount: cart.amount,
            subtotal: cart.subtotal,
            createdBy: userId,
            updatedBy: userId,
          },
        });

        await tx.product.update({
          where: { id: cart.productId },
          data: {
            stock: {
              decrement: cart.amount,
            },
          },
        });
      }

      await tx.cart.deleteMany({
        where: { userId: userId },
      });

      return transaction.id;
    });

    return result;
  } catch (err) {
    console.error("Error while making transaction:", err);
    throw err;
  }
}
