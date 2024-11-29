Steps to Run the Messaging Web App Project

Step 1: Clone the Repository
Clone the repository to your local machine by running the following command in your terminal:

    git clone https://github.com/SujalGupta23/messaging-web-app.git


Step 2: Install Backend Dependencies
Navigate to the backend folder:

    cd messaging-web-app/backend
    
Install the necessary dependencies for the backend:

    npm install


Step 3: Install Frontend Dependencies
After installing backend dependencies, go to the root folder and then to the frontend folder:

    cd ../frontend
    
Install the required frontend dependencies:

    npm install

    
Step 4: Update Database Credentials
Ensure that MySQL is installed on your machine.
Open the csvImporter.py file (located in the backend folder) and update the database connection credentials to match your MySQL database configuration.


Step 5: Initialize the Database
Go back to the backend folder and run the following command to start the server and initialize the database:

    node server.js

    
Step 6: Import CSV Data to the Database
Open another terminal window, navigate to the backend folder, and run the csvImporter.py script to import all the messages from the CSV file into your local database:

    python csvImporter.py


Step 7: Start the Frontend
Open a third terminal window, navigate to the frontend folder, and run the following command to start the frontend:

    npm run dev


Step 8: Project is Ready to Go
Your project is now set up and running! Open your browser and go to http://localhost:3000 to view your application.
