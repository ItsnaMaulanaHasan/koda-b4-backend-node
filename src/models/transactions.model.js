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
      totalTransaction: transaction.totalTransaction,
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
      deliveryFee: transaction.deliveryFee,
      adminFee: transaction.adminFee,
      tax: transaction.tax,
      totalTransaction: transaction.totalTransaction,
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

    return transactionItems;
  } catch (err) {
    console.error("Error while fetching transaction items:", err);
    throw err;
  }
}
