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
