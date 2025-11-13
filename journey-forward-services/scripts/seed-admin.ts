import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

(async () => {
  const hash = await bcrypt.hash("admin123", 12);
  await p.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      passwordHash: hash,
    },
  });
  console.log("seeded: admin / admin123");
  await p.$disconnect();
})();
