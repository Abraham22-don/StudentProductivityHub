
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// Create the assignments table if it doesn't exist
async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      course VARCHAR(100) NOT NULL,
      due DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Not Started'
    )
  `);

  console.log("Database connected and table ready!");
}

// Test route
app.get("/", (req, res) => {
  res.send("Student Productivity Hub API is running!");
});

// Get all assignments
app.get("/api/assignments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM assignments ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load assignments" });
  }
});

// Add an assignment
app.post("/api/assignments", async (req, res) => {
  try {
    const { title, course, due } = req.body;

    if (!title || !course || !due) {
      return res.status(400).json({
        error: "Title, course, and due date are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO assignments (title, course, due)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, course, due]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not add assignment" });
  }
});

// Update assignment status
app.patch("/api/assignments/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE assignments
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update assignment" });
  }
});

// Delete an assignment
app.delete("/api/assignments/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM assignments WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete assignment" });
  }
});

// Start server after database initialization
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
