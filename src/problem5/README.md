## Setup Instructions

Prerequisite:
1. Change the working directory to problem-5:
```bash
cd .\problem-5\
```

2. Ensure that Docker is running
https://www.docker.com/products/docker-desktop/


### 1. Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

### 2. Start the PostgreSQL Database
Use the provided docker-compose.yml to start the PostgreSQL container:

```bash
docker-compose up -d
```


### 3. Set the Environment Variables
Create a .env file in the root of your project and add the following:

```bash
DATABASE_URL=postgresql://postgres:admin@localhost:5432/nhan99tech
```

Make sure the DATABASE_URL matches your database setup.

### 4. Migrate the db
```bash
npx drizzle-kit push
```

### 5. Run the Application
To start the application in development mode, run:

```bash
npm run dev
```

### 6. Test the APIs

- Create user
```bash
curl --location 'http://localhost:3001/api/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "name",
    "email": "test@gmail.com"
}'
```

- Search user
```bash
curl --location 'http://localhost:3001/api/users?email=test'
```

- Get user detail
```bash
curl --location 'http://localhost:3001/api/users/1'
```
Note: Ensure that you replace the id with an existing ID in the database.

- Update user
```bash
curl --location --request PUT 'http://localhost:3001/api/users/1' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "name1",
    "email": "test@gmail.com"
}'
```
Note: Ensure that you replace the id with an existing ID in the database.

- Delete user
```bash
curl --location --request DELETE 'http://localhost:3001/api/users/1'
```
Note: Ensure that you replace the id with an existing ID in the database.