import csv
import mysql.connector
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'sujal@23',  # Replace with your MySQL password
    'database': 'messaging_app',  # Replace with your database name
}

# Function to format datetime
def format_datetime(date_string):
    try:
        # Convert "01-02-17 19:29" to "2017-02-01 19:29:00"
        return datetime.strptime(date_string, "%d-%m-%y %H:%M").strftime("%Y-%m-%d %H:%M:%S")
    except ValueError as e:
        print(f"Error formatting date: {date_string} - {e}")
        return None

# Connect to MySQL database
try:
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor()
    print("Connected to the database.")
except mysql.connector.Error as err:
    print(f"Error connecting to the database: {err}")
    exit()

# Ensure the table exists
TABLE_CREATION_QUERY = """
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    admin_id INT DEFAULT NULL,
    timestamp DATETIME NOT NULL,
    message_body TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    sender VARCHAR(50) NOT NULL DEFAULT 'user'
)
"""
cursor.execute(TABLE_CREATION_QUERY)
print("Ensured messages table exists.")

# CSV file path
CSV_FILE = "GeneralistRails_Project_MessageData.csv"  # Replace with your file path

# Read and insert data from CSV
with open(CSV_FILE, mode='r', encoding='utf-8') as file:
    csv_reader = csv.DictReader(file)  # Comma is the default delimiter
    for row in csv_reader:
        try:
            # Extract and format data
            user_id = int(row["User ID"])
            timestamp = format_datetime(row["Timestamp (UTC)"])
            message_body = row["Message Body"]

            # Skip invalid rows
            if not timestamp or not message_body:
                print(f"Skipping invalid row: {row}")
                continue

            # Insert into the database
            INSERT_QUERY = """
            INSERT INTO messages (user_id, timestamp, message_body, status, sender)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(INSERT_QUERY, (user_id, timestamp, message_body, "pending", "user"))
        except KeyError as e:
            print(f"Error processing row: {row} - Missing field {e}")
        except ValueError as e:
            print(f"Error processing row: {row} - Invalid value {e}")
        except Exception as e:
            print(f"Error processing row: {row} - {e}")

# Commit the transaction and close the connection
connection.commit()
print("CSV data imported successfully.")
cursor.close()
connection.close()
