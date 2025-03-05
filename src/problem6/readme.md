# 🏆 Scoreboard API Specification

## 📌 Mô tả dự án
Hệ thống **Scoreboard API** hỗ trợ hiển thị bảng xếp hạng điểm số, cập nhật điểm theo thời gian thực và đảm bảo tính bảo mật.

---

## 🎯 **Chức năng chính**
1️⃣ **Hiển thị bảng xếp hạng**: Lấy danh sách top 10 người chơi có điểm cao nhất.  
2️⃣ **Cập nhật điểm số**: Khi người dùng hoàn thành một hành động, API sẽ cập nhật điểm.  
3️⃣ **Live update**: Hệ thống cập nhật bảng điểm theo thời gian thực.  
4️⃣ **Bảo mật & xác thực**: Ngăn chặn gian lận trong việc tăng điểm trái phép.  

---

## 🔗 **API Endpoints**
1️⃣ Lấy bảng xếp hạng
📌 **Endpoint:** `GET /api/scoreboard`  
📌 **Response:**
```json
{
  "leaderboard": [
    { "rank": 1, "user": "Tam", "score": 1200 },
    { "rank": 2, "user": "Linh", "score": 1150 }
  ]
}
2️⃣ Cập nhật điểm số
📌 Endpoint: POST /api/update-score
📌 Request:

```json
{
  "userId": "abc123",
  "points": 50
}
📌 Response:

``json
{
  "message": "Score updated successfully",
  "newScore": 1250
}
📌 Bảo mật:
✅ JWT Authentication
✅ Rate Limiting
✅ HMAC Signature

## 🚀 Công nghệ sử dụng
🔹Express.js
🔹TypeScript
🔹PostgreSQL / Redis
🔹WebSocket

## 📜 Giấy phép
MIT License © 2025 by Your Name