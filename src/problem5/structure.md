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
│── db.sqlite               # Database SQLite (tạo tự động)
