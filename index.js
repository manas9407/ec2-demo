const express = require("express");

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
    message: "Hi Hello 👋"
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
      message: "numbers must be an array"
    });
  }

  const sum = numbers.reduce((total, number) => total + number, 0);

  res.json({
    success: true,
    numbers,
    sum
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});