import { PrismaClient } from "@prisma/client";
let prismaInstance;
function getPrismaInstance() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}
export default getPrismaInstance;