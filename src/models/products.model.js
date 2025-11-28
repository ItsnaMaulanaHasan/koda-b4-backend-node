import { prisma } from "../lib/prisma.js";

export async function getTotalDataProducts(search) {
  try {
    const totalData = await prisma.product.count({
      where: {
        name: {
          contains: search,
        },
      },
    });

    return totalData;
  } catch (err) {
    console.error("Failed to get total data products:", err.message);
    throw err;
  }
}

export async function getListProductsAdmin(search, page, limit) {
  try {
    const skip = (page - 1) * limit;
    const take = limit;

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
              productCategories: {
                some: {
                  category: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              },
            },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        productImages: {
          select: {
            productImage: true,
            isPrimary: true,
          },
        },
        productSizes: {
          include: {
            size: {
              select: {
                name: true,
              },
            },
          },
        },
        productCategories: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        productVariants: {
          include: {
            variant: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "asc",
      },
      skip,
      take,
    });

    const result = products.map((product) => {
      const discountPercent = product.discountPercent || 0;
      const discountPrice =
        discountPercent === 0
          ? 0
          : product.price * (1 - discountPercent / 100.0);

      const imagePrimary =
        product.productImages.find((img) => img.isPrimary)?.productImage || "";

      const productImages = product.productImages
        .map((img) => img.productImage)
        .filter(Boolean);

      const productSizes = [
        ...new Set(
          product.productSizes.map((ps) => ps.size?.name).filter(Boolean)
        ),
      ];

      const productCategories = [
        ...new Set(
          product.productCategories
            .map((pc) => pc.category?.name)
            .filter(Boolean)
        ),
      ];

      const productVariants = [
        ...new Set(
          product.productVariants.map((pv) => pv.variant?.name).filter(Boolean)
        ),
      ];

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        discountPercent: discountPercent,
        discountPrice: discountPrice,
        rating: product.rating || 0,
        isFlashSale: product.isFlashSale,
        stock: product.stock || 0,
        isActive: product.isActive,
        isFavourite: product.isFavourite,
        imagePrimary: imagePrimary,
        productImages: productImages,
        productSizes: productSizes,
        productCategories: productCategories,
        productVariants: productVariants,
      };
    });

    return result;
  } catch (err) {
    console.error("Failed to get list products:", err.message);
    throw err;
  }
}

export async function getDetailProduct(productId) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        productImages: {
          select: {
            productImage: true,
          },
        },
        productSizes: {
          include: {
            size: {
              select: {
                name: true,
              },
            },
          },
        },
        productCategories: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        productVariants: {
          include: {
            variant: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    const discountPercent = product.discountPercent || 0;

    const productImages = [
      ...new Set(
        product.productImages.map((img) => img.productImage).filter(Boolean)
      ),
    ];

    const productSizes = [
      ...new Set(
        product.productSizes.map((ps) => ps.size?.name).filter(Boolean)
      ),
    ];

    const productCategories = [
      ...new Set(
        product.productCategories.map((pc) => pc.category?.name).filter(Boolean)
      ),
    ];

    const productVariants = [
      ...new Set(
        product.productVariants.map((pv) => pv.variant?.name).filter(Boolean)
      ),
    ];

    const result = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPercent: discountPercent,
      rating: product.rating || 0,
      isFlashSale: product.isFlashSale,
      stock: product.stock || 0,
      isActive: product.isActive,
      isFavourite: product.isFavourite,
      productImages: productImages,
      productSizes: productSizes,
      productCategories: productCategories,
      productVariants: productVariants,
    };

    return result;
  } catch (err) {
    console.error("Failed to get detail product:", err.message);
    throw err;
  }
}

export async function deleteDataProduct(productId) {
  try {
    const result = await prisma.product.delete({
      where: { id: productId },
      include: {
        productImages: true,
      },
    });

    return result;
  } catch (err) {
    console.error("Error while deleting product: ", err);
    throw err;
  }
}
