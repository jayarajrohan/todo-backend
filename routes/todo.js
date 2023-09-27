const express = require("express");
const { body } = require("express-validator");

const todoControllers = require("../controllers/todo");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/add",
  isAuth,
  body("content").trim().notEmpty().escape(),
  body("date").trim().isDate(),
  body("isCompleted").isBoolean({ strict: true }),
  todoControllers.addTodo
);

router.put(
  "/update/:todoId",
  isAuth,
  body("content").trim().notEmpty().escape(),
  body("date").trim().isDate(),
  body("isCompleted").isBoolean({ strict: true }),
  todoControllers.updateTodo
);

router.delete("/delete/:todoId", isAuth, todoControllers.deleteTodo);

router.get("/all", isAuth, todoControllers.getTodos);

router.get("/:todoId", isAuth, todoControllers.getTodo);

module.exports = router;
