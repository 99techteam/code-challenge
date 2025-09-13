# CRUD Resource Realtime App (problem5) and Architecture (problem6)

Ứng dụng CRUD realtime và cập nhật điểm số realtime được xây dựng với **Turborepo** bao gồm:

- **Frontend**: [Next.js](https://nextjs.org) + [Socket.IO Client](https://socket.io) + Tanstack Query + Zustand
- **Backend**: [NestJS](https://nestjs.com) + [Socket.IO Server](https://socket.io) + [EventEmitter](https://docs.nestjs.com/techniques/events) + JWT
- **Database**: MongoDB
- **Realtime**: Socket.IO cho đồng bộ client ↔ server

---

## 📂 Cấu trúc thư mục

```
.
├── apps
│   ├── frontend   # Next.js app
│   └── backend    # NestJS app
├── turbo.json
├── package.json       # Root config
└── readme.md
```

---

## ⚙️ Yêu cầu

- [Node.js](https://nodejs.org) >= 18
- [npm](https://www.npmjs.com/) (sử dụng npm workspaces)
- [MongoDB](https://www.mongodb.com/) (local hoặc cloud)

---

## 🚀 Cài đặt

Clone dự án và cài dependencies:

```sh
git clone https://github.com/quangnguyentan/code-challenge
cd code-challenge/src/problem5   # hoặc problem6

# Cài dependencies cho toàn bộ workspace
npm install
```

---

## 🔑 Cấu hình môi trường

### Problem 5

Tạo file `.env` trong `apps/backend`:

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=problem5
```

Tạo file `.env` trong `apps/frontend`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000/resource
NEXT_PUBLIC_WS_BASE=http://localhost:8000
```

---

### Problem 6

Tạo file `.env` trong `apps/backend`:

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=problem6
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=2d
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

Tạo file `.env` trong `apps/frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=http://localhost:8000
NEXT_PUBLIC_SECRET_KEY=your_jwt_secret_key
NEXT_PUBLIC_TOKEN_EXPIRES_IN=2d
```

---

## ▶️ Chạy dự án

Turborepo sẽ chạy song song **frontend** và **backend**:

```sh
npm run dev
```

- Frontend chạy tại: `http://localhost:3000`
- Backend chạy tại: `http://localhost:8000`

---

## 🛠️ Build & Start

Build toàn bộ dự án:

```sh
npm run build
```

Start production:

```sh
npm run start
```

---

## 🗄️ Khởi chạy MongoDB

### Windows (sử dụng MongoDB Community)

1. Cài [MongoDB MSI Installer](https://www.mongodb.com/try/download/community).
2. Sau khi cài, chạy dịch vụ MongoDB:
   ```powershell
   net start MongoDB
   ```
3. Mặc định MongoDB chạy trên cổng `27017`.

### macOS (Homebrew)

```sh
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

### Linux (Ubuntu/Debian)

```sh
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 💡 Ghi chú

### Problem 5

- Frontend giao tiếp với backend qua REST API (`/resource`) và **Socket.IO** để cập nhật realtime.
- Backend sử dụng **NestJS EventEmitter** để phát sự kiện nội bộ và đồng bộ với Socket.IO client.
- Database mặc định là **MongoDB local** (`mongodb://localhost:27017/problem5`).

### Problem 6

- Hệ thống cập nhật điểm số realtime khi người dùng hoàn thành nhiệm vụ.
- Bảo mật bằng **JWT accessToken**.
- NextJS frontend sử dụng **Tanstack Query + Zustand** để quản lý state và **Crypto-JS** để mã hóa dữ liệu khi lưu localStorage.
- Backend NestJS xử lý xác thực JWT, cập nhật `score` trong MongoDB và phát sự kiện realtime qua EventEmitter + Socket.IO.

---

## 📘 Thông số kỹ thuật Problem 6

### 1. Tổng quan

Mô-đun này chạy trên backend (NestJS), giúp cập nhật điểm số của người dùng trên bảng điểm website (NextJS) theo thời gian thực. Điểm số tăng ngay khi người dùng hoàn thành hành động, sử dụng accessToken để bảo vệ.

### 2. Yêu cầu cần thực hiện

- **Tích hợp với Bảng điểm**: hiển thị top 10 dựa trên `score`.
- **Cập nhật trực tiếp**: realtime qua EventEmitter.
- **Tăng điểm từ hành động**: cập nhật score khi user hoàn thành task.
- **Gửi yêu cầu API**: frontend dùng Tanstack Query.
- **Bảo vệ hệ thống**: xác thực qua JWT accessToken.

### 3. Kiến trúc hệ thống

- **Client (NextJS)**: Tanstack Query, Zustand, Crypto-JS.
- **Server (NestJS)**: xử lý API, xác thực JWT, cập nhật MongoDB, EventEmitter.
- **Database (MongoDB)**: User schema với `username`, `password (bcrypt)`, `score`, `email`, `role`.

### 4. API Endpoint

- **POST /update-score**
  - Header: `Authorization: Bearer <token>`
  - Params: `{ userId }`
  - Response:
    - 200: `{ "message": "Cập nhật thành công", "newScore": <số> }`
    - 401: Unauthorized
    - 400: Bad Request

### 5. Luồng thực thi

1. User hoàn thành hành động trên web.
2. Client gửi POST `/update-score` với token, userId.
3. Backend kiểm tra token, tăng điểm trong MongoDB.
4. EventEmitter phát sự kiện cập nhật.
5. Client nhận sự kiện, update bảng điểm realtime.

### 6. Nhận xét cải tiến

- Thêm refresh token để bảo mật hơn.
- Rate limiting để chống abuse.
- Thông báo lỗi chi tiết.
- Redis cache cho hiệu suất.

### 7. Ghi chú cho đội ngũ

- Test API với user giả + token hợp lệ trước khi release.
- Frontend cần setup Tanstack Query + Zustand + Crypto-JS.
- Backend quản lý JWT bằng `@nestjs/jwt`.
