import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

enum RoleName {
  ADMIN = "admin",
  USER = "user",
}

enum PermissionName {
  CREATE_USERS = "create:users",
  READ_USERS = "read:users",
  UPDATE_USERS = "update:users",
  DELETE_USERS = "delete:users",
  CREATE_ROLES = "create:roles",
  READ_ROLES = "read:roles",
  UPDATE_ROLES = "update:roles",
  DELETE_ROLES = "delete:roles",
  CREATE_PERMISSIONS = "create:permissions",
  READ_PERMISSIONS = "read:permissions",
  UPDATE_PERMISSIONS = "update:permissions",
  DELETE_PERMISSIONS = "delete:permissions",
}

async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;
  if (!adminPassword || !userPassword) {
    throw new Error(
      "ADMIN_PASSWORD or USER_PASSWORD environment variable is missing or empty"
    );
  }

  await prisma.$transaction(async (prisma) => {
    // Create permissions
    const permissions = await Promise.all(
      Object.values(PermissionName).map((name) =>
        prisma.permission.create({
          data: { name },
        })
      )
    );

    // Bulk create RolePermissions for the admin role
    const adminPermissions = permissions.map((permission) => ({
      permissionId: permission.name,
    }));

    // Create roles and assign permissions
    const adminRole = await prisma.role.create({
      data: {
        name: RoleName.ADMIN,
      },
    });

    await prisma.rolePermission.createMany({
      data: adminPermissions.map((ap) => ({
        roleId: adminRole.id,
        ...ap,
      })),
    });

    // Bulk create RolePermissions for the user role
    const userPermissions = permissions
      .filter((permission) => permission.name.startsWith("read:"))
      .map((permission) => ({
        permissionId: permission.name,
      }));

    const userRole = await prisma.role.create({
      data: {
        name: RoleName.USER,
      },
    });

    await prisma.rolePermission.createMany({
      data: userPermissions.map((up) => ({
        roleId: userRole.id,
        ...up,
      })),
    });

    // Create test users with hashed passwords and assign roles
    await prisma.user.create({
      data: {
        email: "admin@starbeam.io",
        password: await hashPassword(adminPassword),
        roles: {
          create: [{ roleId: adminRole.id }],
        },
      },
    });

    await prisma.user.create({
      data: {
        email: "user@starbeam.io",
        password: await hashPassword(userPassword),
        roles: {
          create: [{ roleId: userRole.id }],
        },
      },
    });

    console.log("Database has been seeded.");
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
