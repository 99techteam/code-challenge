# Bài Toán 2: Biểu Mẫu Quy Đổi Tiền Tệ (Currency Swap Form)

## 📋 Tổng Quan

Đây là một ứng dụng web hiện đại để quy đổi tiền tệ với giao diện đẹp mắt và trải nghiệm người dùng tuyệt vời. Ứng dụng sử dụng API thực tế để lấy tỷ giá hối đoái cập nhật theo thời gian thực.

## ✨ Các Tính Năng Chính

### 1. **Quy Đổi Tiền Tệ Thực Tế**
- Tích hợp API `exchangerate-api.com` để lấy tỷ giá hối đoái cập nhật
- Hỗ trợ 10+ đồng tiền chính: USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, SEK, NZD
- Tính toán tự động khi người dùng nhập số tiền

### 2. **Giao Diện Thân Thiện**
- Thiết kế gradient màu tím hiện đại
- Layout phản hồi (responsive) trên cả mobile và desktop
- Animations mềm mại và chuyển động tự nhiên
- Typography chuyên nghiệp với spacing hợp lý

### 3. **Kiểm Tra Dữ Liệu Đầu Vào (Validation)**
- ✅ Kiểm tra số âm
- ✅ Kiểm tra nhập trống
- ✅ Kiểm tra tiền tệ giống nhau
- ✅ Hiển thị thông báo lỗi động

### 4. **Trạng Thái Tải (Loading/Error States)**
- Spinner tải khi lấy tỷ giá
- Thông báo lỗi/thành công động
- Fallback sang dữ liệu mẫu nếu API không sẵn có
- Tự động làm mới tỷ giá mỗi 5 phút

### 5. **Tương Tác Người Dùng**
- Nút "Swap" để hoán đổi tiền tệ và số tiền
- Hiển thị tỷ giá quy đổi thời gian thực
- Timestamp "Cập nhật lúc" để biết tỷ giá cũ bao lâu
- Nhập liệu theo thời gian thực (real-time)

## 📁 Cấu Trúc File

```
problem2/
├── index.html       # Cấu trúc HTML chính
├── style.css        # Styling và responsive design
├── script.js        # Logic JavaScript và xử lý API
└── README.md        # Tài liệu này
```

## 🚀 Cách Sử Dụng

### Bước 1: Mở Ứng Dụng
Mở file `index.html` trong trình duyệt web bất kỳ.

```bash
# Hoặc sử dụng Live Server (nếu có VS Code)
# Nhấp chuột phải vào index.html > Open with Live Server
```

### Bước 2: Nhập Số Tiền
1. Chọn tiền tệ "Từ" (From) - ví dụ: USD
2. Nhập số tiền cần quy đổi (ví dụ: 100)
3. Chọn tiền tệ "Sang" (To) - ví dụ: EUR

### Bước 3: Xem Kết Quả
- Số tiền tương ứng sẽ tự động hiển thị
- Tỷ giá quy đổi được hiển thị dưới đây
- Nhấp "CONFIRM SWAP" để hoàn tất

### Bước 4: Hoán Đổi Tiền Tệ (Tùy Chọn)
- Nhấp nút hình tròn có mũi tên để hoán đổi
- Tiền tệ và số tiền sẽ được đảo ngược

## 💻 Chi Tiết Kỹ Thuật

### HTML (`index.html`)
- Semantic HTML5 structure
- Form với validation attributes
- Accessible elements (aria-labels, proper semantics)
- Mobile-first responsive design

**Các phần chính:**
```html
1. Card Header - Tiêu đề ứng dụng
2. Form Group 1 - Tiền tệ và số tiền cần gửi
3. Swap Button - Nút hoán đổi
4. Form Group 2 - Tiền tệ và số tiền nhận được
5. Exchange Info - Hiển thị tỷ giá
6. Alerts - Thông báo lỗi/thành công
7. Button Submit - Nút xác nhận
```

### CSS (`style.css`)
**Các tính năng styling:**
- Gradient backgrounds (purple theme)
- Flexbox & Grid layouts
- Smooth transitions và animations
- Responsive breakpoints cho mobile
- Custom form styling
- Loading spinner animation
- Alert animations

**Animations:**
- `slideUp` - Card xuất hiện
- `spin` - Loading spinner quay
- `slideDown` - Alert xuất hiện
- `shake` - Lỗi rung động

### JavaScript (`script.js`)
**Các function chính:**

#### 1. `fetchExchangeRates()`
- Lấy tỷ giá từ API
- Xử lý lỗi gracefully
- Fallback sang dữ liệu mẫu

#### 2. `calculateExchangeRate()`
- Tính toán số tiền đã chuyển đổi
- Kiểm tra dữ liệu nhập
- Cập nhật giao diện

#### 3. `handleSwapCurrencies()`
- Hoán đổi tiền tệ
- Hoán đổi số tiền
- Tính toán lại

#### 4. `handleSwap(event)`
- Xử lý gửi biểu mẫu
- Kiểm tra lỗi cuối cùng
- Hiển thị thông báo thành công

#### 5. Validation Functions
- `showError()` - Hiển thị thông báo lỗi
- `clearErrors()` - Xóa thông báo lỗi
- `showLoading()` - Hiển thị spinner
- `showAlert()` - Hiển thị alert

## 🔌 Tích Hợp API

### API Sử Dụng
**ExchangeRate-API**: https://exchangerate-api.com/

```javascript
// Endpoint: GET https://api.exchangerate-api.com/v4/latest/{base_currency}
// Trả về: Object với rates cho tất cả tiền tệ
{
  "base": "USD",
  "date": "2024-02-14",
  "rates": {
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 149.50,
    // ...
  }
}
```

### Fallback Dữ Liệu
Nếu API không sẵn có, ứng dụng sẽ dùng dữ liệu mẫu được hardcode:
```javascript
exchangeRates = {
  'USD': 1.0,
  'EUR': 0.92,
  'GBP': 0.79,
  // ...
}
```

## ✅ Validation Rules

### Input Amount
- ❌ Không được âm
- ❌ Không được trống (khi submit)
- ✅ Phải là số hợp lệ
- ✅ Hỗ trợ 2 chữ số thập phân

### Currencies
- ❌ Không được chọn cùng tiền tệ
- ✅ Phải chọn từ danh sách có sẵn

### Thông Báo Lỗi
- "Amount cannot be negative" - Số tiền âm
- "Please enter a valid amount" - Số tiền không hợp lệ
- "Please select different currencies" - Tiền tệ giống nhau
- "Exchange rate not available" - Tiền tệ không hỗ trợ
- "Using demo rates (real rates unavailable)" - API lỗi

## 📱 Responsive Design

### Desktop (> 480px)
- Form 2 cột (Currency selector + Input)
- Swap button ở giữa
- Tất cả phần tử hiển thị đầy đủ

### Mobile (≤ 480px)
- Form 1 cột (stacked)
- Tất cả input full width
- Swap button nhỏ hơn
- Spacing nhỏ hơn

## 🎨 Màu Sắc & Thiết Kế

### Color Palette
| Màu | Mã | Mục Đích |
|-----|-----|---------|
| Purple | #667eea | Primary gradient |
| Purple Dark | #764ba2 | Secondary gradient |
| White | #ffffff | Background card |
| Gray | #e0e0e0 | Border |
| Error | #ff6b6b | Lỗi |
| Success | #2f9e44 | Thành công |

### Typography
- Font-family: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- Primary: 16px - Input fields
- Secondary: 14px - Labels, messages
- Heading: 28px - Title

## 🔄 Luồng Dữ Liệu

```
User Input (Amount)
        ↓
onChange Event
        ↓
calculateExchangeRate()
        ↓
Validate Input
        ↓
Fetch Rate từ exchangeRates object
        ↓
Tính: (inputAmount / fromRate) * toRate
        ↓
Cập nhật outputAmount
        ↓
Cập nhật rate display
        ↓
Hiển thị exchange-info
```

## 🐛 Xử Lý Lỗi

### Network Error
```javascript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed');
  // Process data
} catch (error) {
  useMockData(); // Fallback
  showAlert('error', 'Using demo rates');
}
```

### Input Validation
```javascript
if (inputAmount < 0) {
  showError('from', 'Amount cannot be negative');
  return;
}
```

### Currency Not Found
```javascript
if (!exchangeRates[fromCurrency]) {
  showError('from', 'Exchange rate not available');
  return;
}
```

## ⏱️ Auto-Refresh

Tỷ giá được tự động cập nhật mỗi 5 phút:
```javascript
setInterval(fetchExchangeRates, 5 * 60 * 1000);
```

## 🎯 Yêu Cầu Bài Toán - Đã Hoàn Thành

| Yêu Cầu | Trạng Thái |
|---------|-----------|
| Giao diện Form đẹp mắt | ✅ |
| CSS/Styling chuyên nghiệp | ✅ |
| Validation đầu vào | ✅ |
| Xử lý lỗi | ✅ |
| Tương tác API | ✅ |
| Tính toán tỷ giá | ✅ |
| Loading state | ✅ |
| Error state | ✅ |
| UX tốt | ✅ |
| Responsive design | ✅ |

## 🚀 Cải Tiến Tiềm Năng

1. **Lịch Sử Giao Dịch** - Lưu lịch sử quy đổi
2. **Biểu Đồ Tỷ Giá** - Hiển thị biểu đồ giá 7 ngày
3. **Dark Mode** - Chế độ tối
4. **Nhiều Tiền Tệ** - Thêm hỗ trợ cho tất cả tiền tệ
5. **Offline Support** - Cache dữ liệu để sử dụng offline
6. **Thông Báo** - Push notification khi tỷ giá thay đổi

## 📝 Ghi Chú Khác

- **Browser Support**: Chrome, Firefox, Safari, Edge (phiên bản mới)
- **Không cần dependencies**: Thuần HTML/CSS/JavaScript
- **Mobile-first**: Thiết kế từ mobile trước
- **Accessibility**: WCAG compliance với aria-labels

## 👨‍💻 Debug Mode

Mở browser console (F12) để xem:
- Console logs của exchange rates
- Network requests
- JavaScript errors

```javascript
// Logs sẽ in ra:
// "Initializing Currency Swap Form..."
// "Exchange rates updated: {...}"
// "Currency Swap Form initialized successfully!"
```

---

**Ngày tạo:** 14/02/2026  
**Phiên bản:** 1.0.0  
**Tác giả:** Code Challenge Team
