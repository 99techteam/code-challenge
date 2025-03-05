## 📌 Express.js CRUD API with TypeScript

Đây là một dự án **RESTful API** sử dụng **Express.js**, **TypeScript**, và **SQLite** để cung cấp các tính năng **CRUD (Create, Read, Update, Delete)**.  
API cho phép thao tác với một tập hợp **items** và hỗ trợ bộ lọc dữ liệu.  

---

## 📂 Cấu trúc thư mục

express-ts-crud/
│── src/
│   ├── controllers/        # Chứa các controller xử lý logic
│   │   ├── item.controller.ts
│   ├── models/             # Định nghĩa model TypeScript
│   │   ├── item.model.ts
│   ├── routes/             # Chứa tất cả route API
│   │   ├── item.routes.ts
│   ├── config/             # Cấu hình database và env
│   │   ├── database.ts
│   │   ├── dotenv.config.ts
│   ├── server.ts           # File chính để khởi động server
│── README.md               # Hướng dẫn chạy project
│── package.json
│── tsconfig.json
│── .env                    # Cấu hình môi trường
│── db.sqlite                # Database SQLite (tạo tự động)

## 🔗 API Endpoints
|Method |	Endpoint	   | Mô tả	               | Body Params                             |   
|--------------------------------------------------------------------------------------------|
|POST   |   /api/items	   | Tạo mới item	       | { name: string, description?: string }  |   
|GET	|   /api/items	   | Lấy danh sách item	   | ?search=keyword (Tùy chọn)              | 
|GET	|   /api/items/:id | Lấy chi tiết một item | None                                    |
|PUT	|   /api/items/:id | Cập nhật item	       | { name?: string, description?: string } | 
|DELETE |	/api/items/:id | Xóa item	           | None                                    |
|--------------------------------------------------------------------------------------------|
🎯 Ví dụ Request / Response
1️⃣ Tạo mới item
📌 Request (POST /api/items)
```json
{
  "name": "Sách lập trình",
  "description": "Học về TypeScript"
}

📌 Response

```json
{
  "id": 1,
  "name": "Sách lập trình",
  "description": "Học về TypeScript",
  "created_at": "2025-03-05T12:00:00.000Z"
}
2️⃣ Lấy danh sách item (hỗ trợ filter)
📌 Request (GET /api/items?search=sách) 📌 Response

```json
[
  {
    "id": 1,
    "name": "Sách lập trình",
    "description": "Học về TypeScript"
  }
]
3️⃣ Cập nhật item
📌 Request (PUT /api/items/1)

```json
{
  "name": "Sách nâng cao",
  "description": "Học về Node.js"
}
📌 Response

```json
{
  "id": 1,
  "name": "Sách nâng cao",
  "description": "Học về Node.js"
}
4️⃣ Xóa item
📌 Request (DELETE /api/items/1)
📌 Response

```json
{
  "message": "Item deleted successfully"
}

## 📦Công nghệ sử dụng
🔹Express.js
🔹TypeScript
🔹Knex.js
🔹SQLite
🔹dotenv
## 🔧Scripts hữu ích
|Lệnh	        |  Mô tả                           |
|--------------------------------------------------|
|npm run dev	|  Chạy server với hot reload      | 
|npm run build	|  Biên dịch TypeScript            | 
|npm start	    |  Chạy server ở chế độ production |
|npm run lint	|  Kiểm tra code với ESLint        |
|--------------------------------------------------| 
## 🏗 Mở rộng
🔹 Hỗ trợ cơ sở dữ liệu khác (MySQL, PostgreSQL) bằng cách cập nhật knex
🔹 Thêm authentication (JWT, OAuth) cho bảo mật
🔹 Viết test case với Jest hoặc Mocha

## 📜 Giấy phép
MIT License © 2025 by Your Name