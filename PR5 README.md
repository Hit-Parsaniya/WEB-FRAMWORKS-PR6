# Practical-5: Task CRUD API with MongoDB and Mongoose

## Aim

To enhance the Task CRUD REST API developed in Practical-4 by replacing
in-memory storage with persistent MongoDB storage using Mongoose.

## Objectives

-   Connect an Express.js application with MongoDB.
-   Configure the database connection using environment variables.
-   Create a Mongoose schema and model for tasks.
-   Implement CRUD operations using Mongoose.
-   Add centralized error handling.
-   Test all API endpoints using Postman.
-   Verify data persistence after server restart.

## Technologies Used

-   Node.js
-   Express.js
-   MongoDB / MongoDB Atlas
-   Mongoose
-   dotenv
-   Postman

## Project Structure

``` text
task-api/
│
├── models/
│   └── Task.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## Prerequisites

Make sure Node.js, npm, MongoDB/MongoDB Atlas, and Postman are installed
or available.

Check Node.js and npm:

``` bash
node --version
npm --version
```

## Installation

Install the required packages from the project directory:

``` bash
npm install express mongoose dotenv
```

## MongoDB Configuration

Create a `.env` file in the project root and store the MongoDB
connection string in the `MONGO_URI` variable.

Example:

``` env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
PORT=3000
```

Do not commit `.env` to a public repository. Add it to `.gitignore`.

## Database Model

A `Task` model is created using Mongoose.

The task document contains:

  Field           Type      Description
  --------------- --------- ----------------------------------------
  `title`         String    Required task title
  `description`   String    Optional task description
  `completed`     Boolean   Completion status; defaults to `false`
  `createdAt`     Date      Automatically stores creation time

## MongoDB Connection

The application loads environment variables using `dotenv` and connects
to MongoDB through Mongoose.

When the connection is successful, the terminal displays:

``` text
MongoDB connected
```

The server runs on port `3000` by default.

## API Endpoints

  Operation   Method   Endpoint       Description
  ----------- -------- -------------- ---------------------
  Create      POST     `/tasks`       Creates a new task
  Read        GET      `/tasks`       Retrieves all tasks
  Update      PUT      `/tasks/:id`   Updates a task
  Delete      DELETE   `/tasks/:id`   Deletes a task

### Request Example

For creating a task, send JSON data similar to:

``` json
{
  "title": "Complete Practical 6",
  "description": "Implement MongoDB CRUD",
  "completed": false
}
```

The server returns the created MongoDB document along with its generated
`_id`.

## Mongoose CRUD Operations

The application uses the following Mongoose methods:

  Method                       Purpose
  ---------------------------- ----------------
  `Task.find()`                Retrieve tasks
  `Task.create()`              Create a task
  `Task.findByIdAndUpdate()`   Update a task
  `Task.findByIdAndDelete()`   Delete a task

This replaces the temporary array-based storage used in Practical-4.

## Error Handling

Each asynchronous API route uses `try/catch`.

Errors are forwarded using:

``` text
next(err)
```

A global Express error-handling middleware processes the errors and
returns an appropriate HTTP response.

The API also returns `404` when an update or delete operation is
requested for a task that does not exist.

## Testing with Postman

Test the following four endpoints:

1.  **POST `/tasks`** --- create a task.
2.  **GET `/tasks`** --- retrieve all tasks.
3.  **PUT `/tasks/:id`** --- update an existing task.
4.  **DELETE `/tasks/:id`** --- delete an existing task.

For PUT and DELETE, use the `_id` returned by the POST request.

## Persistence Verification

To verify that MongoDB persistence is working:

1.  Create a task using the POST endpoint.
2.  Confirm it appears using GET.
3.  Stop the server with `Ctrl + C`.
4.  Start the server again using:

``` bash
node server.js
```

5.  Run the GET endpoint again.
6.  Confirm that the previously created task is still present.

This confirms that the data is stored in MongoDB rather than only in
application memory.

## Practical-4 vs Practical-6

  Practical-4               Practical-6
  ------------------------- -----------------------------
  In-memory array           MongoDB database
  Data lost after restart   Data persists after restart
  Array operations          Mongoose operations
  No database connection    MongoDB connection
  Basic error handling      Centralized error handling

## Expected Result

The Task CRUD API successfully connects to MongoDB and performs create,
read, update, and delete operations using Mongoose. All four endpoints
work correctly through Postman, and task data remains available after
restarting the Node.js server.

## Learning Outcomes

After completing this practical, the student can:

-   Connect Node.js applications to MongoDB.
-   Create Mongoose schemas and models.
-   Perform CRUD operations using Mongoose.
-   Use environment variables for database configuration.
-   Implement centralized Express error handling.
-   Test REST APIs using Postman.
-   Understand persistent database storage.

## Conclusion

Practical-6 successfully converts the Task CRUD API from temporary
in-memory storage to persistent MongoDB storage using Mongoose. The
application supports complete CRUD functionality, error handling, API
testing, and data persistence across server restarts.
