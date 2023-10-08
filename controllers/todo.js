const { validationResult, matchedData } = require("express-validator");

const Todo = require("../models/todo");
const User = require("../models/user");

exports.addTodo = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const data = matchedData(req);

  const todo = new Todo({
    content: data.content,
    date: data.date,
    isCompleted: data.isCompleted,
    owner: req.userId,
  });

  todo
    .save()
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.todos.push(todo);
      return user.save();
    })
    .then(() => {
      res.status(201).json({ message: "Todo created", todo: todo });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.updateTodo = (req, res, next) => {
  const todoId = req.params.todoId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const data = matchedData(req);

  Todo.findById(todoId)
    .then((todoDoc) => {
      if (!todoDoc) {
        const error = new Error("Todo does not exist");
        error.statusCode = 404;
        error.data = errors.array();
        throw error;
      }

      todoDoc.content = data.content;
      todoDoc.date = data.date;
      todoDoc.isCompleted = data.isCompleted;

      return todoDoc.save();
    })
    .then((todoDoc) => {
      res.status(200).json({
        message: "Todo successfully updated",
        todoId: todoDoc._id.toString(),
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.deleteTodo = (req, res, next) => {
  const todoId = req.params.todoId;

  Todo.deleteOne({ _id: todoId })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.todos.pull(todoId);
      return user.save();
    })
    .then(() => {
      res.status(200).json({
        message: "Todo successfully deleted",
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getTodos = (req, res, next) => {
  Todo.find({ owner: req.userId })
    .then((todos) => {
      res
        .status(200)
        .json({ message: "Todos fetched successfully", todos: todos });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getTodo = (req, res, next) => {
  const todoId = req.params.todoId;

  Todo.findById(todoId)
    .then((todoDoc) => {
      if (!todoDoc) {
        const error = new Error("Todo does not exist");
        error.statusCode = 404;
        error.data = errors.array();
        throw error;
      }

      res
        .status(200)
        .json({ message: "Todo fetched successfully", todo: todoDoc });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
