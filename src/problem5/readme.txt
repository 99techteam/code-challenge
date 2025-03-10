# Problem 5: A Crude Server

## 🚀 Project Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd problem5
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file with the following variables:
```env
PORT=
MONGO_URI=
NODE_ENV=
```

### 4. Start the Server
#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

The server will run at `http://localhost:3000`.

---

## 📦 Docker Deployment

### 1. Build Docker Image
```bash
docker build -t problem5-app .
```

### 2. Run Docker Container
```bash
docker run -p 3000:3000 --env-file .env --name problem5-container problem5-app
```

### 3. Check Logs
```bash
docker logs -f problem5-container
```

---

## 📚 API Endpoints

### Base URL
`http://localhost:3000`

### CRUD Operations
| Method | Endpoint        | Description         |
|--------|-----------------|---------------------|
| GET    | `/items`        | Get all items       |
| GET    | `/items/:id`    | Get item by ID      |
| POST   | `/items`        | Create a new item   |
| PUT    | `/items/:id`    | Update item by ID   |
| DELETE | `/items/:id`    | Delete item by ID   |

---

## 🧪 Testing API
You can test the API using tools like Postman or curl.

Example request to get all items:
```bash
curl http://localhost:3000/items
```

---

## 🛠️ Useful Docker Commands

- **Stop Container:**
```bash
docker stop problem5-container
```

- **Remove Container:**
```bash
docker rm problem5-container
```

- **Remove Image:**
```bash
docker rmi problem5-app
```

---

## 💡 Tips
- Make sure MongoDB is running and accessible.
- Double-check `.env` file configuration.

---

Happy coding! 🎉

