import process from "node:process";
import { prisma } from "../lib/prisma.js";

export async function getDetailProfile(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            profilePhoto: true,
            fullName: true,
            address: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const formattedUser = {
      id: user.id,
      profilePhoto: user.profile?.profilePhoto || "",
      fullName: user.profile?.fullName || "",
      email: user.email,
      phone: user.profile?.phoneNumber || "",
      address: user.profile?.address || "",
      role: user.role,
      joinDate: user.createdAt,
    };

    return formattedUser;
  } catch (err) {
    console.error("Error while fetching profile:", err);
    throw err;
  }
}

export async function updateDataProfile(userId, bodyUpdate) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          ...(bodyUpdate.email && { email: bodyUpdate.email }),
          updatedBy: userId,
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      const profile = await tx.profile.update({
        where: { userId: userId },
        data: {
          ...(bodyUpdate.fullName && { fullName: bodyUpdate.fullName }),
          ...(bodyUpdate.address && { address: bodyUpdate.address }),
          ...(bodyUpdate.phone && { phoneNumber: bodyUpdate.phone }),
          updatedBy: userId,
        },
        select: {
          profilePhoto: true,
          fullName: true,
          address: true,
          phoneNumber: true,
        },
      });

      return {
        id: user.id,
        profilePhoto: profile.profilePhoto || "",
        fullName: profile.fullName,
        email: user.email,
        phone: profile.phoneNumber || "",
        address: profile.address || "",
        role: user.role,
        joinDate: user.createdAt,
      };
    });

    return result;
  } catch (err) {
    console.error("Error while updating profile:", err);
    throw err;
  }
}

export async function getProfilePhotoById(userId) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
      select: {
        profilePhoto: true,
      },
    });

    return profile?.profilePhoto || "";
  } catch (err) {
    console.error("Error while fetching profile photo:", err);
    throw err;
  }
}

export async function uploadProfilePhotoUser(userId, savedFilePath) {
  try {
    await prisma.profile.update({
      where: { userId: userId },
      data: {
        profilePhoto: process.env.BASE_UPLOAD_URL + savedFilePath,
        updatedBy: userId,
      },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (err) {
    console.error("Error while uploading profile photo:", err);
    throw err;
  }
}
