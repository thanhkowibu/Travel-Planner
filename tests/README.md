# 🧪 Test Cases cho Smart Travel Planner

## 📌 Quick Start

### Chạy Automated Tests:

```bash
# Bước 1: Đảm bảo backend đang chạy
cd ai-engine
uvicorn main:app --reload --port 8000

# Bước 2 (Terminal mới): Cài dependencies
cd tests
pip install -r requirements.txt

# Bước 3: Chạy tests
python automated_test.py
```

### Kết quả:

- ✅ Console output với màu sắc
- ✅ Auto-generate report JSON
- ✅ Pass/Fail statistics

---

## 📋 Files

| File                 | Mô tả                      |
| -------------------- | -------------------------- |
| `test_cases.json`    | 15 test cases định nghĩa   |
| `automated_test.py`  | Script Python chạy tự động |
| `TESTING_GUIDE.md`   | Hướng dẫn chi tiết 📖      |
| `requirements.txt`   | Python dependencies        |
| `test_report_*.json` | Reports (auto-generated)   |

---

## 🎯 15 Test Cases

### Edge Cases (5):

- TC01: Budget 50k
- TC02: Budget 10M
- TC03: Time 2h
- TC10: Budget 0
- TC15: Impossible constraints

### Normal Cases (2):

- TC04: Full day
- TC05: Standard (500k) ⭐

### City Cases (2):

- TC06: Đà Nẵng - High budget
- TC07: Đà Nẵng - Low budget

### Pace Cases (3):

- TC08: Fast
- TC09: Slow
- TC14: Comparison ⭐

### Algorithm Cases (3):

- TC11: Performance test
- TC12: High mutation
- TC13: No mutation

---

## 📊 Demo Priority

### Must Test: ⭐⭐⭐⭐⭐

1. TC05 - Standard (500k)
2. TC01 - Budget thấp (50k)
3. TC14 - Fast/Normal/Slow comparison
4. TC06 - Đà Nẵng

### Should Test:

- TC03, TC10, TC11

---

## 🔍 Manual Testing

Xem file `TESTING_GUIDE.md` để biết:

- Cách test từng case thủ công
- Expected results chi tiết
- Demo strategy
- Troubleshooting

---

## 📈 Sample Output

```
============================================================
Test TC01: Budget cực thấp - 50k
============================================================

Kết quả:
  - Số địa điểm: 2
  - Tổng chi phí: 0đ
  - Tổng thời gian: 120m
  - Thời gian chạy: 1.85s

Validation:
  ✓ Locations: 2 >= 1 ✓
  ✓ Cost: 0đ <= 50,000đ ✓

  ✅ PASSED
```

---

Xem thêm: **TESTING_GUIDE.md** 📖
