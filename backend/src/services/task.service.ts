import { TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const getTasksForUser = (userId: string, status?: string) => {
  const where: { userId: string; status?: TaskStatus } = { userId };
  if (status === "active") where.status = TaskStatus.ACTIVE;
  if (status === "completed") where.status = TaskStatus.COMPLETED;
  return prisma.task.findMany({ where, orderBy: { createdAt: "desc" } });
};

export const getTaskByIdAndUser = (id: string, userId: string) =>
  prisma.task.findFirst({ where: { id, userId } });

export const createTask = (
  userId: string,
  data: { title: string; description?: string }
) =>
  prisma.task.create({
    data: { title: data.title, description: data.description, userId },
  });

export const updateTask = (
  id: string,
  userId: string,
  data: { title?: string; description?: string; status?: TaskStatus }
) =>
  prisma.task.updateMany({ where: { id, userId }, data });

export const deleteTask = (id: string, userId: string) =>
  prisma.task.deleteMany({ where: { id, userId } });
