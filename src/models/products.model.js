import process from "node:process";
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

export async function checkProductName(name) {
  try {
    const product = await prisma.product.findUnique({
      where: { name },
    });
    return !!product;
  } catch (err) {
    console.error("Error while checking product name: ", err);
    throw err;
  }
}

export async function createDataProduct(
  data,
  imageFiles,
  sizeIds,
  categoryIds,
  variantIds,
  userId
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          discountPercent: data.discountPercent || 0,
          rating: data.rating || 5,
          isFlashSale: data.isFlashSale || false,
          stock: data.stock,
          isActive: data.isActive !== undefined ? data.isActive : true,
          isFavourite: data.isFavourite || false,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      if (imageFiles && imageFiles.length > 0) {
        const imageData = imageFiles.map((file, index) => ({
          productId: product.id,
          productImage:
            process.env.BASE_UPLOAD_URL + "/products/" + file.filename,
          isPrimary: index === 0,
          createdBy: userId,
          updatedBy: userId,
        }));

        await tx.productImage.createMany({
          data: imageData,
        });
      }

      if (sizeIds && sizeIds.length > 0) {
        const sizeData = sizeIds.map((sizeId) => ({
          productId: product.id,
          sizeId: parseInt(sizeId),
          createdBy: userId,
          updatedBy: userId,
        }));

        await tx.productSize.createMany({
          data: sizeData,
        });
      }

      if (categoryIds && categoryIds.length > 0) {
        const categoryData = categoryIds.map((categoryId) => ({
          productId: product.id,
          categoryId: parseInt(categoryId),
          createdBy: userId,
          updatedBy: userId,
        }));

        await tx.productCategory.createMany({
          data: categoryData,
        });
      }

      if (variantIds && variantIds.length > 0) {
        const variantData = variantIds.map((variantId) => ({
          productId: product.id,
          variantId: parseInt(variantId),
          createdBy: userId,
          updatedBy: userId,
        }));

        await tx.productVariant.createMany({
          data: variantData,
        });
      }

      const completeProduct = await tx.product.findUnique({
        where: { id: product.id },
        include: {
          productImages: true,
          productSizes: {
            include: { size: true },
          },
          productCategories: {
            include: { category: true },
          },
          productVariants: {
            include: { variant: true },
          },
        },
      });

      return completeProduct;
    });

    return result;
  } catch (err) {
    console.error("Error while creating product: ", err);
    throw err;
  }
}

export async function updateDataProduct(
  productId,
  data,
  imageFiles,
  sizeIds,
  categoryIds,
  variantIds,
  userId
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          discountPercent: data.discountPercent || 0,
          rating: data.rating || 5,
          isFlashSale: data.isFlashSale || false,
          stock: data.stock,
          isActive: data.isActive !== undefined ? data.isActive : true,
          isFavourite: data.isFavourite || false,
          updatedBy: userId,
        },
      });

      if (imageFiles && imageFiles.length > 0) {
        await tx.productImage.deleteMany({
          where: { productId: productId },
        });

        const imageData = imageFiles.map((file, index) => ({
          productId: product.id,
          productImage:
            process.env.BASE_UPLOAD_URL + "/products/" + file.filename,
          isPrimary: index === 0,
          createdBy: userId,
          updatedBy: userId,
        }));

        await tx.productImage.createMany({
          data: imageData,
        });
      }

      if (sizeIds !== undefined) {
        await tx.productSize.deleteMany({
          where: { productId: productId },
        });

        if (sizeIds.length > 0) {
          const sizeData = sizeIds.map((sizeId) => ({
            productId: product.id,
            sizeId: parseInt(sizeId),
            createdBy: userId,
            updatedBy: userId,
          }));

          await tx.productSize.createMany({
            data: sizeData,
          });
        }
      }

      if (categoryIds !== undefined) {
        await tx.productCategory.deleteMany({
          where: { productId: productId },
        });

        if (categoryIds.length > 0) {
          const categoryData = categoryIds.map((categoryId) => ({
            productId: product.id,
            categoryId: parseInt(categoryId),
            createdBy: userId,
            updatedBy: userId,
          }));

          await tx.productCategory.createMany({
            data: categoryData,
          });
        }
      }

      if (variantIds !== undefined) {
        await tx.productVariant.deleteMany({
          where: { productId: productId },
        });

        if (variantIds.length > 0) {
          const variantData = variantIds.map((variantId) => ({
            productId: product.id,
            variantId: parseInt(variantId),
            createdBy: userId,
            updatedBy: userId,
          }));

          await tx.productVariant.createMany({
            data: variantData,
          });
        }
      }

      const completeProduct = await tx.product.findUnique({
        where: { id: product.id },
        include: {
          productImages: true,
          productSizes: {
            include: { size: true },
          },
          productCategories: {
            include: { category: true },
          },
          productVariants: {
            include: { variant: true },
          },
        },
      });

      return completeProduct;
    });

    return result;
  } catch (err) {
    console.error("Error while updating product: ", err);
    throw err;
  }
}

export async function checkProductNameForUpdate(name, excludeId) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        name,
        id: { not: excludeId },
      },
    });
    return !!product;
  } catch (err) {
    console.error("Error while checking product name: ", err);
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

export async function getListFavouriteProducts(limit) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isFavourite: true,
        isActive: true,
      },
      take: limit,
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        discountPercent: true,
        isFlashSale: true,
        isFavourite: true,
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
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPercent: product.discountPercent || 0,
      discountPrice:
        product.discountPercent && product.discountPercent > 0
          ? product.price * (1 - product.discountPercent / 100)
          : 0,
      isFlashSale: product.isFlashSale,
      isFavourite: product.isFavourite,
      productImage:
        product.productImages.length > 0
          ? product.productImages[0].productImage
          : "",
    }));

    return formattedProducts;
  } catch (err) {
    console.error("Error while fetching favourite products: ", err);
    throw err;
  }
}

export async function totalDataProductsPublic(q, cat, maxPrice, minPrice) {
  try {
    const whereClause = {
      isActive: true,
    };

    if (q) {
      whereClause.name = {
        contains: q,
        mode: "insensitive",
      };
    }

    if (cat && cat.length > 0) {
      whereClause.productCategories = {
        some: {
          category: {
            name: {
              in: cat,
            },
          },
        },
      };
    }

    if (minPrice > 0 || maxPrice > 0) {
      whereClause.price = {};
      if (minPrice > 0) {
        whereClause.price.gte = minPrice;
      }
      if (maxPrice > 0) {
        whereClause.price.lte = maxPrice;
      }
    }

    const totalData = await prisma.product.count({
      where: whereClause,
    });

    return totalData;
  } catch (err) {
    console.error("Error while counting products:", err);
    throw err;
  }
}

export async function getListProductsPublic(
  q,
  cat,
  sort,
  maxPrice,
  minPrice,
  limit,
  page
) {
  try {
    const offset = (page - 1) * limit;

    const whereClause = {
      isActive: true,
    };

    if (q) {
      whereClause.name = {
        contains: q,
        mode: "insensitive",
      };
    }

    if (cat && cat.length > 0) {
      whereClause.productCategories = {
        some: {
          category: {
            name: {
              in: cat,
            },
          },
        },
      };
    }

    if (minPrice > 0 || maxPrice > 0) {
      whereClause.price = {};
      if (minPrice > 0) {
        whereClause.price.gte = minPrice;
      }
      if (maxPrice > 0) {
        whereClause.price.lte = maxPrice;
      }
    }

    let orderBy = { id: "asc" };
    if (sort) {
      switch (sort) {
        case "name_asc":
          orderBy = { name: "asc" };
          break;
        case "name_desc":
          orderBy = { name: "desc" };
          break;
        case "price_asc":
          orderBy = { price: "asc" };
          break;
        case "price_desc":
          orderBy = { price: "desc" };
          break;
      }
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        discountPercent: true,
        isFlashSale: true,
        isFavourite: true,
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
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPercent: product.discountPercent || 0,
      discountPrice:
        product.discountPercent && product.discountPercent > 0
          ? product.price * (1 - product.discountPercent / 100)
          : 0,
      isFlashSale: product.isFlashSale,
      isFavourite: product.isFavourite,
      productImage:
        product.productImages.length > 0
          ? product.productImages[0].productImage
          : "",
    }));

    return formattedProducts;
  } catch (err) {
    console.error("Error while fetching products:", err);
    throw err;
  }
}

export async function getDetailProductPublic(id) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        discountPercent: true,
        rating: true,
        isFlashSale: true,
        stock: true,
        productImages: {
          select: {
            productImage: true,
          },
        },
        productCategories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        productSizes: {
          select: {
            size: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        productVariants: {
          select: {
            variant: {
              select: {
                id: true,
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

    const categoryIds = product.productCategories.map((pc) => pc.category.id);

    const recommendations = await prisma.product.findMany({
      where: {
        id: { not: id },
        isActive: true,
        productCategories: {
          some: {
            categoryId: {
              in: categoryIds,
            },
          },
        },
      },
      take: 5,
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        discountPercent: true,
        isFlashSale: true,
        isFavourite: true,
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
    });

    const shuffledRecommendations = recommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPercent: product.discountPercent || 0,
      discountPrice:
        product.discountPercent && product.discountPercent > 0
          ? product.price * (1 - product.discountPercent / 100)
          : 0,
      rating: product.rating || 0,
      isFlashSale: product.isFlashSale,
      stock: product.stock || 0,
      productImages: product.productImages.map((img) => img.productImage),
      productCategories: product.productCategories.map(
        (pc) => pc.category.name
      ),
      productSizes: product.productSizes.map((ps) => ({
        id: ps.size.id,
        size: ps.size.name,
      })),
      productVariants: product.productVariants.map((pv) => ({
        id: pv.variant.id,
        variant: pv.variant.name,
      })),
      recommendations: shuffledRecommendations.map((rec) => ({
        id: rec.id,
        name: rec.name,
        description: rec.description,
        price: rec.price,
        discountPercent: rec.discountPercent || 0,
        discountPrice:
          rec.discountPercent && rec.discountPercent > 0
            ? rec.price * (1 - rec.discountPercent / 100)
            : 0,
        isFlashSale: rec.isFlashSale,
        isFavourite: rec.isFavourite,
        productImage:
          rec.productImages.length > 0 ? rec.productImages[0].productImage : "",
      })),
    };

    return formattedProduct;
  } catch (err) {
    console.error("Error while fetching product detail:", err);
    throw err;
  }
}
