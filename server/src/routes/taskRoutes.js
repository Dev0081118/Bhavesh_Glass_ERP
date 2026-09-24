const express =
  require("express");

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const {
  listTasks,
  getAssignableUsers,
  createTask,
  updateTask,
  deleteTask,
} = require(
  "../controllers/taskController"
);

const router =
  express.Router();

router.use(
  protect
);

router.get(
  "/assignees",
  getAssignableUsers
);

router.get(
  "/",
  listTasks
);

router.post(
  "/",
  createTask
);

router.patch(
  "/:id",
  updateTask
);

router.delete(
  "/:id",
  deleteTask
);

module.exports =
  router;