# 🧪 Hướng dẫn Testing - Smart Travel Planner

## 📋 Tổng quan

Bộ test này bao gồm **15 test cases** để kiểm tra logic thuật toán Genetic Algorithm trong các tình huống thực tế.

## 📁 Cấu trúc

```
tests/
├── test_cases.json          # 15 test cases định nghĩa
├── automated_test.py        # Script tự động chạy tests
├── TESTING_GUIDE.md         # File này
└── test_report_*.json       # Reports được generate tự động
```

## 🚀 Cách chạy Tests

### Phương pháp 1: Automated Testing (Khuyến nghị)

#### Bước 1: Chuẩn bị

```bash
# Đảm bảo backend đang chạy
cd ai-engine
uvicorn main:app --reload --port 8000
```

#### Bước 2: Cài đặt dependencies

```bash
pip install requests
```

#### Bước 3: Chạy tests

```bash
cd tests
python automated_test.py
```

#### Kết quả:

- Hiển thị chi tiết từng test case trên console
- Generate file `test_report_YYYYMMDD_HHMMSS.json`
- Summary với pass rate

### Phương pháp 2: Manual Testing (Qua Frontend)

#### Bước 1: Mở trình duyệt

```
http://localhost:3000
```

#### Bước 2: Test từng case thủ công

**Sử dụng bảng test cases bên dưới:**

---

## 📊 15 Test Cases Chi tiết

### 🔥 Edge Cases (Quan trọng nhất cho demo)

#### TC01: Budget cực thấp - 50k ⭐⭐⭐

**Input:**

- Thành phố: Hà Nội
- Ngân sách: 50,000đ
- Thời gian: 8h - 18h
- Pace: Normal

**Expected:**

- ✅ Có kết quả (ít nhất 1 địa điểm)
- ✅ Chi phí <= 50,000đ
- ✅ Chỉ địa điểm FREE hoặc giá thấp (Hồ Hoàn Kiếm, Lăng Bác, Cầu Long Biên)

**Cách test manual:**

1. Vào trang chủ
2. Chọn Hà Nội, budget 50000, 8-18h
3. Bấm "Lập kế hoạch"
4. Kiểm tra kết quả

**Điểm demo:** Chứng minh GA xử lý được edge case

---

#### TC02: Budget cực cao - 10 triệu ⭐⭐⭐

**Input:**

- Thành phố: Hà Nội
- Ngân sách: 10,000,000đ
- Thời gian: 8h - 18h
- Pace: Normal

**Expected:**

- ✅ Có nhiều địa điểm (>= 5)
- ✅ Tối ưu thời gian hơn là tiền
- ✅ Rating cao

**Điểm demo:** Chứng minh GA không tham lam, vẫn tối ưu fitness

---

#### TC03: Thời gian cực ngắn - 2 giờ ⭐⭐⭐

**Input:**

- Thành phố: Hà Nội
- Ngân sách: 500,000đ
- Thời gian: 10h - 12h (2 giờ)
- Pace: Normal

**Expected:**

- ✅ Có kết quả (1-2 địa điểm)
- ✅ Tổng thời gian <= 120 phút
- ✅ Không vượt quá ràng buộc

**Điểm demo:** Penalty function hoạt động tốt

---

#### TC10: Budget = 0 (Free only) ⭐⭐⭐

**Input:**

- Thành phố: Hà Nội
- Ngân sách: 0đ
- Thời gian: 8h - 18h
- Pace: Normal

**Expected:**

- ✅ Có kết quả (chỉ địa điểm FREE)
- ✅ Chi phí = 0đ
- ✅ Ví dụ: Hồ Hoàn Kiếm, Lăng Bác, Phố Cổ, Cầu Long Biên

**Điểm demo:** Rescue logic hoạt động

---

#### TC15: Impossible Constraint ⭐⭐

**Input:**

- Thành phố: Hà Nội
- Ngân sách: 10,000đ
- Thời gian: 10h - 10.5h (30 phút)
- Pace: Normal

**Expected:**

- ✅ Vẫn có kết quả (1 địa điểm free hoặc rỗng)
- ✅ Không crash

**Điểm demo:** Robust error handling

---

### 📏 Normal Cases

#### TC05: Budget vừa phải - 500k (Standard) ⭐⭐⭐⭐⭐

**Input:**

- Thành phố: Hà Nội
- Ngân sách: 500,000đ
- Thời gian: 8h - 18h
- Pace: Normal

**Expected:**

- ✅ 4-8 địa điểm
- ✅ Chi phí <= 500,000đ
- ✅ Thời gian <= 600 phút
- ✅ Cân bằng giữa số lượng và chất lượng

**Điểm demo:** Test case chuẩn cho demo chính

---

#### TC04: Thời gian dài - Cả ngày

**Input:**

- Thành phố: Hà Nội
- Ngân sách: 1,000,000đ
- Thời gian: 7h - 22h (15 giờ)
- Pace: Normal

**Expected:**

- ✅ Nhiều địa điểm (>= 8)
- ✅ Phân bố đều cả ngày

---

### 🏖️ City-Specific Cases

#### TC06: Đà Nẵng - Budget cao ⭐⭐⭐

**Input:**

- Thành phố: Đà Nẵng
- Ngân sách: 2,000,000đ
- Thời gian: 7h - 22h
- Pace: Normal

**Expected:**

- ✅ Có thể bao gồm Bà Nà Hills (800k, 6 tiếng)
- ✅ Chi phí <= 2,000,000đ

**Điểm demo:** Xử lý địa điểm đắt + tốn thời gian

---

#### TC07: Đà Nẵng - Budget thấp

**Input:**

- Thành phố: Đà Nẵng
- Ngân sách: 100,000đ
- Thời gian: 8h - 18h
- Pace: Normal

**Expected:**

- ✅ Chủ yếu biển + free spots
- ✅ Ví dụ: Mỹ Khê, Non Nước, Sơn Trà

---

### 🏃 Pace Variations

#### TC08: Pace Fast - Nhanh ⭐⭐⭐

**Input:**

- Thành phố: Hà Nội
- Ngân sách: 500,000đ
- Thời gian: 8h - 18h
- Pace: Fast

**Expected:**

- ✅ Nhiều địa điểm hơn Normal (>= 6)
- ✅ Thời gian mỗi chỗ giảm 30%

---

#### TC09: Pace Slow - Thong thả

**Input:**

- Thành phố: Hà Nội
- Ngân sách: 500,000đ
- Thời gian: 8h - 18h
- Pace: Slow

**Expected:**

- ✅ Ít địa điểm hơn Normal (<= 6)
- ✅ Thời gian mỗi chỗ tăng 30%

---

#### TC14: So sánh: Fast vs Normal vs Slow ⭐⭐⭐⭐

**Input:** Chạy 3 lần với cùng budget/time:

1. Pace: Fast
2. Pace: Normal
3. Pace: Slow

**Expected:**

- ✅ Fast > Normal > Slow về số lượng địa điểm
- ✅ Chứng minh pace modifier hoạt động

**Cách test:**

1. Chạy lần 1 với Fast → Lưu số địa điểm
2. Chạy lần 2 với Normal → Lưu số địa điểm
3. Chạy lần 3 với Slow → Lưu số địa điểm
4. So sánh: Fast >= Normal >= Slow

---

### ⚙️ Algorithm Parameters

#### TC11: Performance Test - 100 generations ⭐⭐⭐

**Input:**

- City: Hà Nội
- Budget: 500,000đ
- Time: 8h-18h
- **Params:**
  - Population: 100
  - Generations: 100
  - Mutation: 0.1

**Expected:**

- ✅ Thời gian chạy < 10 giây
- ✅ Kết quả tốt hơn mặc định

**Cách test:**

1. Vào trang Playground
2. Kéo Population = 100, Generations = 100
3. Nhập thông tin chuyến đi
4. Bấm "Chạy thuật toán"
5. Check thời gian execution

---

#### TC12: Mutation Rate cao - 50% ⭐⭐

**Input:**

- Params: Mutation Rate = 50%

**Expected:**

- ✅ Kết quả không ổn định
- ✅ Fitness dao động nhiều

**Điểm demo:** Giải thích tại sao mutation rate tốt nhất là 5-15%

---

#### TC13: Mutation Rate = 0% ⭐⭐

**Input:**

- Params: Mutation Rate = 0%

**Expected:**

- ✅ Dễ kẹt local optimum
- ✅ Fitness hội tụ sớm

**Điểm demo:** Chứng minh vai trò của mutation

---

## 📈 Test Priority (Cho demo)

### Must Test (Top 5): ⭐⭐⭐⭐⭐

1. **TC05** - Standard case (500k)
2. **TC01** - Budget thấp (50k)
3. **TC02** - Budget cao (10 triệu)
4. **TC14** - So sánh Fast/Normal/Slow
5. **TC06** - Đà Nẵng với Bà Nà

### Should Test (Optional): ⭐⭐⭐

- TC03 - Thời gian ngắn
- TC10 - Budget = 0
- TC11 - Performance test

### Nice to Have:

- Các test còn lại

---

## 📊 Expected Results Table

| Test | Budget | Time   | Expected Locations | Expected Cost | Pass Criteria     |
| ---- | ------ | ------ | ------------------ | ------------- | ----------------- |
| TC01 | 50k    | 8-18h  | 1-2                | <= 50k        | Free spots only   |
| TC02 | 10M    | 8-18h  | 5+                 | <= 10M        | Many high-rating  |
| TC03 | 500k   | 10-12h | 1-2                | <= 500k       | <= 120 minutes    |
| TC05 | 500k   | 8-18h  | 4-8                | <= 500k       | Balanced          |
| TC06 | 2M     | 7-22h  | 3+                 | <= 2M         | May include Bà Nà |

---

## 🎯 Demo Strategy

### Khi demo trước hội đồng:

#### 1. Bắt đầu với Standard Case (TC05)

- Chạy trực tiếp trên frontend
- Giải thích kết quả
- Show timeline + map

#### 2. Show Edge Cases

- TC01 (50k) → Chứng minh xử lý budget thấp
- TC02 (10M) → Chứng minh không tham lam
- TC10 (Budget 0) → Rescue logic

#### 3. Vào Playground

- TC11 → Điều chỉnh tham số
- Show execution time
- Giải thích trade-off

#### 4. So sánh Pace

- TC14 → Chạy 3 lần Fast/Normal/Slow
- Show số địa điểm khác nhau

### Câu trả lời sẵn:

**Q: Tại sao không dùng Brute Force?**

> A: Với 23 địa điểm, Brute Force phải thử 23! = 25 tỷ tỷ năm. GA chỉ mất 2 giây và cho kết quả 95-98% tối ưu.

**Q: Làm sao đảm bảo không vượt budget/time?**

> A: Fitness Function có Penalty. Vượt budget → trừ điểm. Nếu vẫn lố sau 50 thế hệ, có rescue logic cắt bỏ địa điểm rating thấp nhất.

**Q: Mutation Rate tốt nhất là bao nhiêu?**

> A: 5-15%. Quá cao = không hội tụ. Quá thấp = kẹt local optimum. Demo TC12 và TC13 để chứng minh.

---

## 🐛 Troubleshooting

### Lỗi: Cannot connect to API

```bash
# Kiểm tra backend
cd ai-engine
uvicorn main:app --reload --port 8000
```

### Lỗi: Test failed

- Check backend logs
- Check input data hợp lệ
- Check database có địa điểm không

### Performance chậm

- Giảm POPULATION_SIZE
- Giảm GENERATIONS
- Check CPU usage

---

## 📝 Checklist Demo

- [ ] Backend đang chạy
- [ ] Frontend đang chạy
- [ ] Đã test TC05 (standard)
- [ ] Đã test TC01 (edge case budget thấp)
- [ ] Đã test TC14 (so sánh pace)
- [ ] Đã test Playground với tham số khác nhau
- [ ] Có report từ automated test
- [ ] Hiểu rõ Fitness Function
- [ ] Sẵn sàng giải thích penalty logic

---

## 📄 Report Format

Automated test sẽ generate file JSON:

```json
{
  "timestamp": "2026-01-06T...",
  "summary": {
    "total": 15,
    "passed": 14,
    "failed": 1,
    "pass_rate": "93.3%"
  },
  "results": [
    {
      "test_id": "TC01",
      "test_name": "Budget cực thấp - 50k",
      "passed": true,
      "result": {
        "location_count": 2,
        "total_cost": 0,
        "execution_time": 1.85
      }
    }
  ]
}
```

---

## 🎊 Kết luận

Bộ test này bao phủ:

- ✅ Edge cases (budget/time extremes)
- ✅ Normal cases
- ✅ City variations
- ✅ Pace variations
- ✅ Algorithm parameters
- ✅ Performance testing

**Demo-ready!** Chỉ cần chạy automated test một lần, screenshot report, và giữ lại để trình bày. 🚀

---

**Good luck with your demo!** 🎉
