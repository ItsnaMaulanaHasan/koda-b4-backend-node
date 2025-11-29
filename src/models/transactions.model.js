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
