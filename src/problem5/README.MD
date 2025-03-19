# TODO App

## Setup Instructions

### 1. Create the Database and Table
Before running the application, ensure that the PostgreSQL database and the `todo` table are created.

#### **Create Database**
```sh
psql -U your_username
CREATE DATABASE your_database;
```

#### **Connect to the Database**
```sh
psql -U your_username -d your_database
```

#### **Create the `todo` Table**
```sql
CREATE TABLE todo (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Install Dependencies
Once the database is set up, install the necessary dependencies:
```sh
yarn install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory and add your database configuration:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
```

### 4. Run the Application
After setting up the database and environment variables, start the application:
```sh
yarn start
```

### 5. Verify Database Connection
Check if the database is properly connected and the table is accessible:
```sh
psql -U your_username -d your_database -c "SELECT * FROM todo;"
```

### 6. View Logs & Debugging
If you encounter issues, check the logs:
```sh
yarn dev
```