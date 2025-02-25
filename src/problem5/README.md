# Problem 5



This is a Node.js application that serves as an API for managing todo lists. It uses Express.js for handling HTTP requests and TypeORM for interacting with a MySQL database.



## Getting Started



These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.



### Prerequisites



You will need the following software installed on your machine:



- [Node.js](https://nodejs.org/en/download/)

- [npm](https://www.npmjs.com/get-npm)



### Installing


1. Clone the repository:

```bash
git clone https://github.com/hawingstarling/code-challenge.git
```

2. Change into the project directory:

```bash
cd problem5
```

3. Install the dependencies:

```bash
npm install
```

4. Create a .env file in the root directory and add the necessary environment variables.

5. Create database code_challenge in MySQL

6. Run database migration

```bash
npm run migration:apply
```

7. Run the application in development mode:

```bash
npm run dev
```

Open http://localhost:3000 or your configured port in your browser

8. Access the Swagger UI by opening your browser and navigating to http://localhost:3000/api-docs (change the host and port number if needed)

9. Run the application in production mode:

```bash
npm run start
```