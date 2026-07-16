import { Router, Response, NextFunction } from "express";
import { TaskStatus } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import {
  getTasksForUser,
  getTaskByIdAndUser,
  createTask,
  updateTask,
  deleteTask,
} from "../services/task.service";

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET /tasks — return only the authenticated user's tasks
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query["status"] as string | undefined;
    const tasks = await getTasksForUser(req.userId!, status);
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

// POST /tasks — create a task for the authenticated user; title is required
router.post("/", async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description } = req.body as {
      title?: string;
      description?: string;
    };

    if (!title || title.trim() === "") {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const task = await createTask(req.userId!, {
      title: title.trim(),
      description: description?.trim(),
    });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id — update task; verify req.userId === task.userId before updating
router.put("/:id", async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = req.params["id"] as string;

    // Ownership check: fetch task only if it belongs to this user
    const existing = await getTaskByIdAndUser(taskId, req.userId!);
    if (!existing) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const { title, description, status } = req.body as {
      title?: string;
      description?: string;
      status?: TaskStatus;
    };

    if (status && !Object.values(TaskStatus).includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    await updateTask(taskId, req.userId!, {
      title: title?.trim(),
      description: description?.trim(),
      status,
    });

    // Return the updated record
    const updated = await getTaskByIdAndUser(taskId, req.userId!);
    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id — delete task; verify req.userId === task.userId before deleting
router.delete("/:id", async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = req.params["id"] as string;

    // Ownership check: only delete if task belongs to this user
    const existing = await getTaskByIdAndUser(taskId, req.userId!);
    if (!existing) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await deleteTask(taskId, req.userId!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
