const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const http = require("http");
const db = require("./dbSetup");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(bodyParser.json());
app.use(cors());

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/messages", (req, res) => {
  db.query("SELECT * FROM messages ORDER BY timestamp ASC", (err, rows) => {
    if (err) {
      console.error("Error fetching messages:", err.message);
      return res.status(500).json({ error: "Failed to fetch messages." });
    }
    res.json(rows);
  });
});

app.post("/messages/reply", (req, res) => {
  const { user_id, message_body, admin_id } = req.body;

  if (!user_id || !message_body || !admin_id) {
    return res
      .status(400)
      .json({ error: "User ID, message body, and admin ID are required." });
  }

  // Insert admin reply
  const insertReplyQuery = `
    INSERT INTO messages (user_id, message_body, sender, status, timestamp, admin_id)
    VALUES (?, ?, 'admin', 'replied', NOW(), ?)
  `;

  db.query(
    insertReplyQuery,
    [user_id, message_body, admin_id],
    (err, result) => {
      if (err) {
        console.error("Error adding admin reply:", err.message);
        return res.status(500).json({ error: "Failed to add reply." });
      }

      // Update all messages for the user to 'replied'
      const updateStatusQuery = `
      UPDATE messages SET status = 'replied' WHERE user_id = ?
    `;
      db.query(updateStatusQuery, [user_id], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating message statuses:", updateErr.message);
          return res
            .status(500)
            .json({ error: "Failed to update message statuses." });
        }

        const newReply = {
          id: result.insertId,
          user_id,
          message_body,
          sender: "admin",
          status: "replied",
          timestamp: new Date().toISOString(),
          admin_id,
        };

        io.emit("new-message", newReply); // Notify clients of the new reply
        res.status(201).json({
          message: "Reply added and statuses updated successfully.",
          reply: newReply,
          updatedRows: updateResult.affectedRows,
        });
      });
    }
  );
});

app.post("/messages/search", (req, res) => {
  const { query } = req.body; // Extract 'query' from the request body

  if (!query) {
    return res.status(400).json({ error: "Search query is required." });
  }

  const sql = `
    SELECT * FROM messages
    WHERE user_id LIKE ? OR message_body LIKE ?
    ORDER BY timestamp ASC
  `;
  const searchTerm = `%${query}%`; // Add wildcards for partial matching

  db.query(sql, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("Error searching messages:", err.message);
      return res.status(500).json({ error: "Failed to search messages." });
    }
    res.json(results);
  });
});

app.listen(3000, () =>
  console.log("Server is running on http://localhost:3000")
);
