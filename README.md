# 🧳 Smart Travel Planner - AI Du lịch thông minh

> Ứng dụng lập kế hoạch du lịch thông minh sử dụng **Genetic Algorithm** để tối ưu hóa lịch trình.

## 🎯 Tính năng chính

### 1. 🏠 Lập kế hoạch du lịch

- Nhập thông tin: Thành phố, ngân sách, thời gian, phong cách
- AI tự động tối ưu lịch trình (Genetic Algorithm)
- Hiển thị timeline + bản đồ tương tác
- Tự động lưu vào lịch sử

### 2. 🕒 Lịch sử tìm kiếm

- Xem lại 10 lịch trình gần nhất
- Không cần đăng nhập (localStorage)
- Cứu cánh khi demo (nếu AI lag)

### 3. ⚙️ Algorithm Playground

- Điều chỉnh tham số GA:
  - Population Size (20-200)
  - Generations (10-200)
  - Mutation Rate (0-100%)
- Xem metrics: Thời gian chạy, chi phí, số địa điểm

### 4. 🧠 Cách hoạt động (How It Works)

- Giải thích Genetic Algorithm chi tiết
- Quy trình 5 bước: Khởi tạo → Fitness → Selection → Crossover → Mutation
- So sánh GA vs Brute Force
- Biểu đồ hội tụ

### 5. 📊 Thống kê & Phân tích

- Tổng số tìm kiếm, ngân sách TB
- Biểu đồ phân bố thành phố
- Danh mục địa điểm phổ biến

## 🚀 Hướng dẫn chạy

### Backend (AI Engine)

```bash
cd ai-engine
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (Next.js)

```bash
cd client
npm install
npm run dev
```

### Testcases

```bash
cd tests
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python automated_test.py
```

# Bước 3: Chạy tests

python automated_test.py

### Truy cập

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📁 Cấu trúc project

```
Travel-Planner/
├── ai-engine/              # Backend (FastAPI + Genetic Algorithm)
│   ├── main.py            # API endpoints
│   ├── genetic_solver.py  # Thuật toán GA
│   └── requirements.txt
├── client/                 # Frontend (Next.js)
│   ├── app/
│   │   ├── page.tsx           # Trang chủ
│   │   ├── history/           # Lịch sử
│   │   ├── playground/        # Playground
│   │   ├── how-it-works/      # Giải thích AI
│   │   └── stats/             # Thống kê
│   └── components/
│       ├── Sidebar.tsx        # Navigation
│       └── MapComponent.tsx   # Bản đồ
└── data/
    └── locations.json      # 23 địa điểm (Hà Nội + Đà Nẵng)
```

## 🧬 Thuật toán Genetic Algorithm

### Tham số mặc định

- **Population Size:** 50
- **Generations:** 50
- **Mutation Rate:** 10%

### Fitness Function

```
Fitness = Tổng Rating - Penalty

Penalty:
- Vượt ngân sách: (cost - budget) × 0.1
- Vượt thời gian: (time - max_time) × 10.0
```

### Quy trình

1. **Khởi tạo:** Tạo 50 lịch trình ngẫu nhiên
2. **Đánh giá:** Tính Fitness cho mỗi cá thể
3. **Chọn lọc:** Giữ lại top 50% tốt nhất
4. **Lai ghép:** Crossover 2 bố mẹ → 2 con
5. **Đột biến:** 10% cơ hội thay đổi ngẫu nhiên
6. **Lặp lại** 100 lần

## 📊 Dữ liệu

### Hà Nội (12 địa điểm)

- Lịch sử: Lăng Bác, Văn Miếu, Nhà Tù Hỏa Lò, Cầu Long Biên
- Văn hóa: Chùa Một Cột, Phố Cổ, Chợ Đồng Xuân
- Thiên nhiên: Hồ Hoàn Kiếm, Hồ Tây
- Ẩm thực: Phở Bát Đàn, Bún Chả, Cafe Giảng

### Đà Nẵng (11 địa điểm)

- Bãi biển: Mỹ Khê, Non Nước
- Giải trí: Bà Nà Hills, Cầu Vàng
- Văn hóa: Ngũ Hành Sơn, Chùa Linh Ứng, Phố Cổ Hội An
- Ẩm thực: Hải Sản Bé Mặn, Mì Quảng

**Tất cả tọa độ GPS đều chính xác từ Google Maps!**

## 🎨 Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Leaflet (Bản đồ)
- Lucide Icons

### Backend

- FastAPI (Python)
- Genetic Algorithm (Custom)
- CORS

### Storage

- localStorage (Lịch sử)
- JSON file (Địa điểm)
