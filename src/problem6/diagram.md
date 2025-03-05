# 🎨 Scoreboard API - Diagram Flow

## 📌 Luồng xử lý chính

```plaintext
[User] --> [Frontend] --> [API Gateway] --> [Scoreboard Service] --> [Database]
```

## 🎯 **Mô tả chi tiết**

1️⃣ **Người dùng thực hiện một hành động trên website.**  
2️⃣ **Frontend gọi API `/update-score` để cập nhật điểm.**  
3️⃣ **API kiểm tra tính hợp lệ của yêu cầu (JWT Token, HMAC hoặc OAuth2).**  
4️⃣ **Nếu hợp lệ, hệ thống cập nhật điểm vào database.**  
5️⃣ **Sự kiện `SCORE_UPDATED` được gửi đến WebSocket hoặc Redis Pub/Sub để cập nhật real-time.**  
6️⃣ **Bảng xếp hạng được cập nhật ngay lập tức.**  

---

## 📌 **Sơ đồ chi tiết**

```plaintext
          +-----------+        +-------------+        +-----------------+        +--------------+
          |   User    | ---->  | Frontend UI | ---->  | API Gateway     | ---->  | Auth Service |
          +-----------+        +-------------+        +-----------------+        +--------------+
                                                       |
                                                       v
                                              +------------------+
                                              | Scoreboard API   |
                                              +------------------+
                                                       |
                                                       v
                                         +--------------------------+
                                         | Database (PostgreSQL)    |
                                         +--------------------------+
                                                       |
                                                       v
                                         +--------------------------+
                                         | Redis (Pub/Sub or Cache) |
                                         +--------------------------+
                                                       |
                                                       v
                                         +--------------------------+
                                         | WebSocket Server         |
                                         +--------------------------+
```

## 🚀 **Công nghệ sử dụng**
- **Express.js**
- **TypeScript**
- **PostgreSQL**
- **Redis**
- **WebSocket**
- **JWT & OAuth2**

