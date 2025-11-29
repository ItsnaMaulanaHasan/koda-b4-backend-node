import { prisma } from "../lib/prisma.js";

export async function getListHistories(userId, page, limit, date, statusId) {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {
      userId: userId,
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      whereClause.dateTransaction = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (statusId > 0) {
      whereClause.statusId = statusId;
    }

    const totalData = await prisma.transaction.count({
      where: whereClause,
    });

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
            product: {
              select: {
                productImages: {
                  where: {
                    isPrimary: true,
                  },
                  select: {
                    productImage: true,
                  },
                  take: 1,
                },
              },
            },
          },
          take: 1,
        },
      },
    });

    const formattedHistories = transactions.map((transaction) => ({
      id: transaction.id,
      noInvoice: transaction.noInvoice,
      dateTransaction: transaction.dateTransaction,
      status: transaction.status.name,
      totalTransaction: transaction.totalTransaction,
      image:
        transaction.transactionItems.length > 0 &&
        transaction.transactionItems[0].product.productImages.length > 0
          ? transaction.transactionItems[0].product.productImages[0]
              .productImage
          : "",
    }));

    return {
      histories: formattedHistories,
      totalData: totalData,
    };
  } catch (err) {
    console.error("Error while fetching histories:", err);
    throw err;
  }
}

export async function getDetailHistory(noInvoice) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { noInvoice: noInvoice },
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

    const transactionItems = await prisma.transactionItem.findMany({
      where: { transactionId: transaction.id },
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
        product: {
          select: {
            productImages: {
              select: {
                productImage: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const historyDetail = {
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
      deliveryFee: transaction.deliveryFee,
      adminFee: transaction.adminFee,
      tax: transaction.tax,
      totalTransaction: transaction.totalTransaction,
      historyItems: transactionItems.map((item) => ({
        id: item.id,
        transactionId: item.transactionId,
        productId: item.productId,
        productName: item.productName,
        productImage:
          item.product.productImages.length > 0
            ? item.product.productImages[0].productImage
            : "",
        productPrice: item.productPrice,
        discountPercent: item.discountPercent,
        discountPrice: item.discountPrice,
        size: item.size,
        sizeCost: item.sizeCost,
        variant: item.variant,
        variantCost: item.variantCost,
        amount: item.amount,
        subtotal: item.subtotal,
      })),
    };

    return historyDetail;
  } catch (err) {
    console.error("Error while fetching history detail:", err);
    throw err;
  }
}
