const express = require("express");
require("dotenv").config();
const pool = require("./db");

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

/**
 * GET /
 */
app.get("/", (req, res) => {
  res.send("EC2 API is running 🚀");
});

/**
 * GET /hello
 */
app.get("/hello", (req, res) => {
  res.json({
    message: "Hi Hello 👋",
  });
});

/**
 * POST /sum
 * Body:
 * {
 *   "numbers": [10,20,30]
 * }
 */
app.post("/sum", (req, res) => {
  const { numbers } = req.body;

  if (!Array.isArray(numbers)) {
    return res.status(400).json({
      success: false,
      message: "numbers must be an array",
    });
  }

  const sum = numbers.reduce((total, number) => total + number, 0);

  res.json({
    success: true,
    numbers,
    sum,
  });
});

/* =====================================================
        CRUD APIs FOR RDS (PostgreSQL)
===================================================== */

/**
 * CREATE USER
 * POST /users
 *
 * Body:
 * {
 *   "name":"Manas",
 *   "email":"manas@gmail.com"
 * }
 */
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and Email are required",
      });
    }

    const result = await pool.query(
      "INSERT INTO users(name,email) VALUES($1,$2) RETURNING *",
      [name, email]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET ALL USERS
 * GET /users
 */
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY id ASC"
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET USER BY ID
 * GET /users/:id
 */
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM users WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * UPDATE USER
 * PUT /users/:id
 *
 * Body:
 * {
 *   "name":"Rahul",
 *   "email":"rahul@gmail.com"
 * }
 */
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const result = await pool.query(
      "UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *",
      [name, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE USER
 * DELETE /users/:id
 */
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * CHECK DATABASE CONNECTION
 * GET /db
 */
app.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database connected successfully",
      serverTime: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});