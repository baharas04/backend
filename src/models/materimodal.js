import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createMateri = async (data) => {
  return await prisma.Materi.create({ data });
};

export const getAllMateri = async () => {
  return await prisma.Materi.findMany({
    orderBy: {
      id: 'asc'
    }
  });
  
};

export const getMateriById = async (id) => {
  return await prisma.Materi.findUnique({ where: { id } });
};

export const updateMateri = async (id, data) => {
  return await prisma.Materi.update({ where: { id }, data });
};

export const deleteMateri = async (id) => {
  return await prisma.Materi.delete({ where: { id } });
};




