require("dotenv").config();
const mysql = require("mysql2");

// Create a connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST, // Your MySQL server host
  user: process.env.DB_USER, // Your MySQL username
  password: process.env.DB_PASSWORD, // Your MySQL password
  database: process.env.DB_NAME, // Database name
});

// Create messages table if it doesn't exist
db.query(
  `
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        user_id INT,
        timestamp DATETIME,
        message_body TEXT,
        status VARCHAR(50) DEFAULT 'pending'
    )
`,
  (err) => {
    if (err) throw err;
    console.log("Messages table ensured.");
  }
);

module.exports = db;
