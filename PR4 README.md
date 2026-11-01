# Express.js CRUD Practical

## Aim
To implement CRUD (Create, Read, Update, Delete) operations using Express.js and test the APIs using Postman.

## Requirements
- Node.js
- npm
- Express.js
- Postman

## Project Setup
```bash
mkdir express-crud
cd express-crud
npm init -y
npm install express
node index.js
```

## Middleware
```js
app.use(express.json());
```
This parses incoming JSON request bodies.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /students | Get all students |
| GET | /students/:id | Get student by ID |
| POST | /students | Create a student |
| PUT | /students/:id | Update a student |
| DELETE | /students/:id | Delete a student |

## Sample JSON (POST)
```json
{
  "id": 3,
  "name": "Karan",
  "age": 22
}
```

## Testing with Postman
1. Start the server: `node index.js`
2. Open Postman.
3. Send requests to `http://localhost:3000`.
4. Use **Body → raw → JSON** for POST and PUT.

## Expected Results
- GET returns student data.
- POST adds a new student.
- PUT updates an existing student.
- DELETE removes a student.
- Responses are returned in JSON format.

## Conclusion
The practical successfully demonstrates RESTful CRUD operations using Express.js. Postman is used to verify each endpoint by sending HTTP requests and checking JSON responses.
