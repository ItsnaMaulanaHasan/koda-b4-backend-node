import process from "node:process";
import { hashPassword } from "../lib/hashPasswordArgon2.js";
import { prisma } from "../lib/prisma.js";

// authentication
export async function getUserByEmail(email) {
  try {
    const result = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    return result;
  } catch (err) {
    console.log("Error while get data user by email: ", err);
    throw err;
  }
}

export async function registerUser(data) {
  try {
    const hashed = await hashPassword(data.password);

    const result = await prisma.user.create({
      data: {
        email: data.email,
        role: data.role || "customer",
        password: hashed,
        profile: {
          create: {
            fullName: data.fullName,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    await prisma.user.update({
      where: { id: result.id },
      data: {
        createdBy: result.id,
        updatedBy: result.id,
      },
    });

    await prisma.profile.update({
      where: { userId: result.id },
      data: {
        createdBy: result.id,
        updatedBy: result.id,
      },
    });

    return result;
  } catch (err) {
    console.log("Error while register: ", err);
    throw err;
  }
}

export async function checkUserEmail(email) {
  try {
    const result = await prisma.user.findFirst({
      where: { email: email },
    });

    if (result) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("Error get user by email:", err);
    throw err;
  }
}

// admin users
export async function getTotalDataUsers(search) {
  try {
    const totalData = await prisma.user.count({
      where: {
        profile: {
          fullName: {
            contains: search || "",
          },
        },
      },
    });

    return totalData;
  } catch (err) {
    console.log("Failed to get total data users:", err.message);
    throw err;
  }
}

export async function getListUsers(search, page, limit) {
  try {
    const skip = (page - 1) * limit;
    const take = limit;

    const datas = await prisma.user.findMany({
      where: {
        profile: {
          fullName: {
            contains: search || "",
          },
        },
      },
      include: {
        profile: true,
      },
      skip,
      take,
    });

    const result = datas.map((data) => ({
      id: data.id,
      profilePhoto: data.profile?.profilePhoto || "",
      fullName: data.profile?.fullName || "",
      email: data.email,
      address: data.profile?.address || "",
      phone: data.profile?.phoneNumber || "",
      role: data.role,
    }));

    return result;
  } catch (err) {
    console.log("Failed to get list users:", err.message);
    throw err;
  }
}

export async function getDetailUser(id) {
  try {
    const data = await prisma.user.findFirst({
      where: {
        id: id,
      },
      include: {
        profile: true,
      },
    });

    const result = {
      id: data.id,
      profilePhoto: data.profile?.profilePhoto || "",
      fullName: data.profile?.fullName || "",
      email: data.email,
      address: data.profile?.address || "",
      phone: data.profile?.phoneNumber || "",
      role: data.role,
    };

    return result;
  } catch (err) {
    console.log("Failed to get detail user:", err.message);
    throw err;
  }
}

export async function createDataUser(data) {
  try {
    const hashed = await hashPassword(data.password);

    const result = await prisma.user.create({
      data: {
        email: data.email,
        role: data.role || "customer",
        password: hashed,
        profile: {
          create: {
            profilePhoto: process.env.BASE_UPLOAD_URL + data.profilePhoto,
            fullName: data.fullName,
            phoneNumber: data.phone,
            address: data.address,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    await prisma.user.update({
      where: { id: result.id },
      data: {
        createdBy: result.id,
        updatedBy: result.id,
      },
    });

    await prisma.profile.update({
      where: { userId: result.id },
      data: {
        createdBy: result.id,
        updatedBy: result.id,
      },
    });

    return result;
  } catch (err) {
    console.log("Error while create data user: ", err);
    throw err;
  }
}

export async function checkUserEmailExcludingId(email, excludeUserId) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        id: {
          not: excludeUserId,
        },
      },
    });
    return !!user;
  } catch (err) {
    console.log("Error while checking email: ", err);
    throw err;
  }
}

export async function updateDataUser(userId, data) {
  try {
    const profileData = {};
    if (data.profilePhoto !== undefined)
      profileData.profilePhoto = data.profilePhoto;
    if (data.fullName !== undefined) profileData.fullName = data.fullName;
    if (data.phone !== undefined) profileData.phoneNumber = data.phone;
    if (data.address !== undefined) profileData.address = data.address;

    const userData = {};
    if (data.email !== undefined) userData.email = data.email;
    if (data.role !== undefined) userData.role = data.role;

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...userData,
        updatedBy: userId,
        profile: {
          update: {
            ...profileData,
            updatedBy: userId,
          },
        },
      },
      include: {
        profile: true,
      },
    });
  } catch (err) {
    console.log("Error while updating user: ", err);
    throw err;
  }
}
