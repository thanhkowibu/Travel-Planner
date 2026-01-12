# 🎬 KỊCH BẢN DEMO - Smart Travel Planner

> **Thời lượng dự kiến:** 8-10 phút  
> **Công cụ quay:** OBS Studio / Loom / ShareX  
> **Độ phân giải:** 1920x1080 (Full HD)

---

## 📋 CHECKLIST TRƯỚC KHI QUAY

```
□ Backend đang chạy (http://localhost:8000)
□ Frontend đang chạy (http://localhost:3000)
□ Mở sẵn VS Code với file genetic_solver.py
□ Mở sẵn Terminal để chạy test
□ Tắt thông báo (Discord, Zalo, etc.)
□ Mic hoạt động tốt
□ Chuẩn bị nước uống 🍵
```

---

## PHẦN 1: GIỚI THIỆU (1 phút)

### 🎤 Lời thoại:

> _[Màn hình: Slide tiêu đề hoặc trang chủ app]_

"Xin chào thầy và các bạn. Em là Phạm Lê Thành, MSSV 20225765.

Hôm nay em sẽ demo sản phẩm **Smart Travel Planner** - một ứng dụng web thông minh giúp lập kế hoạch du lịch tự động.

Ứng dụng sử dụng **Giải thuật Di truyền - Genetic Algorithm** để tối ưu hóa lịch trình du lịch dựa trên nhiều ràng buộc như: ngân sách, thời gian, và các địa điểm người dùng muốn ghé thăm.

Đây là sự phát triển tiếp nối từ đồ án NCTN1 - ứng dụng CRUD đặt phòng, nay được nâng cấp với trí tuệ nhân tạo."

---

## PHẦN 2: DEMO GIAO DIỆN ỨNG DỤNG (2 phút)

### 🎤 Lời thoại:

> _[Màn hình: Mở trình duyệt tại http://localhost:3000]_

"Đầu tiên, em sẽ giới thiệu qua giao diện ứng dụng.

**Trang chủ** là nơi người dùng nhập thông tin chuyến đi:

- Chọn **thành phố**: Hà Nội hoặc Đà Nẵng
- Chọn **phong cách đi**: Nhanh, Bình thường, hoặc Thong thả
- Nhập **ngân sách** tối đa
- Chọn **khung giờ** bắt đầu và kết thúc

Ngoài ra còn có các tùy chọn nâng cao:

- **Điểm xuất phát**: Nơi bắt đầu hành trình
- **Địa điểm bắt buộc**: Những nơi nhất định phải ghé thăm"

> _[Thao tác: Click vào các dropdown để show]_

"Sau khi nhấn **Lập kế hoạch ngay**, hệ thống sẽ gọi API đến backend Python, thuật toán Genetic Algorithm sẽ chạy và trả về lịch trình tối ưu.

Kết quả hiển thị dưới dạng **Timeline** với thời gian cụ thể cho từng điểm, và **Bản đồ tương tác** hiển thị vị trí các địa điểm."

> _[Thao tác: Nhập Budget 500000, Start 8h, End 18h, nhấn Lập kế hoạch]_

"Như các bạn thấy, thuật toán đã tìm ra lịch trình với tổng chi phí nằm trong ngân sách, và tổng thời gian không vượt quá khung giờ đã chọn."

---

## PHẦN 3: GIẢI THÍCH THUẬT TOÁN (3-4 phút)

### 🎤 Lời thoại:

> _[Màn hình: Chuyển sang VS Code, mở file `ai-engine/genetic_solver.py`]_

"Bây giờ em sẽ giải thích chi tiết về thuật toán Genetic Algorithm đã cài đặt.

### 3.1. Tham số Hyperparameters

> _[Highlight dòng 5-7]_

```python
POPULATION_SIZE = 100   # Số lượng lịch trình trong một quần thể
GENERATIONS = 100       # Số lần tiến hóa (lặp lại)
MUTATION_RATE = 0.1     # Tỷ lệ đột biến (10%)
```

Em sử dụng:

- **100 cá thể** trong mỗi quần thể - tức là mỗi thế hệ có 100 lịch trình khác nhau
- **100 thế hệ** tiến hóa - thuật toán sẽ cải thiện dần qua 100 vòng lặp
- **Tỷ lệ đột biến 10%** - đủ để tạo đa dạng mà không làm mất ổn định

---

### 3.2. Hàm Fitness - Đánh giá chất lượng

> _[Scroll đến hàm calculate_fitness, highlight dòng 24-62]_

```python
def calculate_fitness(self, individual):
    # ... tính tổng rating, cost, time ...

    # Phạt nếu vượt ngân sách
    if total_cost > self.budget:
        penalty += (total_cost - self.budget) * 0.1

    # Phạt nếu vượt thời gian
    if total_time > self.max_time:
        penalty += (total_time - self.max_time) * 15.0

    return total_rating - penalty
```

Hàm Fitness là **trái tim** của thuật toán. Nó đánh giá chất lượng của một lịch trình:

- **Fitness cao** = Lịch trình tốt (nhiều điểm rating cao, không vi phạm ràng buộc)
- **Fitness thấp/âm** = Lịch trình tệ (vượt ngân sách hoặc thời gian)

Điểm đặc biệt là em sử dụng **Soft Penalty** - không loại bỏ ngay lập tức các cá thể vi phạm, mà trừ điểm để thuật toán có thể tự học và cải thiện.

---

### 3.3. Khởi tạo cá thể

> _[Scroll đến hàm create_individual, highlight dòng 65-88]_

```python
def create_individual(self):
    # Lấy các điểm must-visit trước
    must_visits = [loc for loc in self.all_locations
                   if loc['id'] in self.must_visit_ids]

    # LUÔN chèn start_point vào vị trí đầu tiên
    if self.start_point:
        individual.insert(0, self.start_point)
```

Khi tạo cá thể mới:

1. Đảm bảo các **điểm bắt buộc** luôn được bao gồm
2. **Điểm xuất phát** luôn ở vị trí đầu tiên
3. Các điểm còn lại được chọn ngẫu nhiên

---

### 3.4. Lai ghép (Crossover)

> _[Scroll đến hàm crossover, highlight dòng 91-100]_

```python
def crossover(self, parent1, parent2):
    # Cắt tại điểm ngẫu nhiên, hoán đổi nửa sau
    point = random.randint(2, min(len(parent1), len(parent2)) - 1)
    child1 = parent1[:point] + parent2[point:]
    child2 = parent2[:point] + parent1[point:]
```

Em sử dụng **Single Point Crossover**:

- Chọn một điểm cắt ngẫu nhiên
- Con 1 = Nửa đầu của Bố + Nửa sau của Mẹ
- Con 2 = Nửa đầu của Mẹ + Nửa sau của Bố

Lưu ý: Index 0 (điểm xuất phát) không bao giờ bị thay đổi.

---

### 3.5. Đột biến (Mutation)

> _[Scroll đến hàm mutate, highlight dòng 103-125]_

```python
def mutate(self, individual):
    if random.random() < MUTATION_RATE:
        if mutation_type < 0.5:    # Thay thế
            individual[idx] = new_loc
        elif mutation_type < 0.75: # Thêm
            individual.append(new_loc)
        else:                      # Xóa
            individual.pop(idx)
```

Đột biến có 3 kiểu:

- **50% Thay thế**: Đổi một địa điểm thành địa điểm khác
- **25% Thêm**: Thêm một địa điểm mới vào cuối
- **25% Xóa**: Bỏ bớt một địa điểm (trừ điểm bắt buộc)

---

### 3.6. Vòng lặp chính

> _[Scroll đến hàm solve, highlight dòng 128-163]_

```python
def solve(self):
    # Bước 1: Khởi tạo 100 lịch trình ngẫu nhiên
    population = [self.create_individual() for _ in range(POPULATION_SIZE)]

    for gen in range(GENERATIONS):
        # Bước 2: Đánh giá Fitness
        scored_population = [(ind, self.calculate_fitness(ind)) ...]

        # Bước 3: Chọn lọc top 50%
        top_half = [x[0] for x in scored_population[:POPULATION_SIZE // 2]]

        # Bước 4: Lai ghép + Đột biến → Thế hệ mới
```

Quy trình tiến hóa:

1. **Khởi tạo** 100 lịch trình ngẫu nhiên
2. **Đánh giá** điểm Fitness cho từng cá thể
3. **Chọn lọc** 50% cá thể tốt nhất làm bố mẹ
4. **Lai ghép + Đột biến** tạo thế hệ mới
5. **Lặp lại** 100 lần

Sau 100 thế hệ, trả về cá thể có Fitness cao nhất."

---

## PHẦN 4: CHẠY TEST CASES (2-3 phút)

### 🎤 Lời thoại:

> _[Màn hình: Mở Terminal, cd vào thư mục tests]_

"Để đảm bảo thuật toán hoạt động đúng, em đã xây dựng hệ thống **17 test cases** tự động.

Em sẽ chạy một vài test cases tiêu biểu."

> _[Thao tác: Chạy lệnh]_

```bash
cd tests
python automated_test.py
```

---

### Test Case 1: Budget cực thấp (TC01)

> _[Chờ kết quả TC01 hiện ra]_

"**TC01** kiểm tra với ngân sách chỉ 50,000đ.

Kết quả: Thuật toán tìm được lịch trình với chi phí bằng 0 - chỉ bao gồm các địa điểm miễn phí như Hồ Hoàn Kiếm, Lăng Bác.

✅ **PASSED** - Đáp ứng ràng buộc ngân sách."

---

### Test Case 5: Standard (TC05)

> _[Chờ kết quả TC05 hiện ra]_

"**TC05** là test case chuẩn với ngân sách 500,000đ, thời gian 10 tiếng.

Kết quả: 4-6 địa điểm, chi phí dưới 500k, thời gian dưới 600 phút.

✅ **PASSED** - Cân bằng tốt giữa số lượng và chất lượng."

---

### Test Case 15: Fixed Start Point (TC15)

> _[Chờ kết quả TC15 hiện ra]_

"**TC15** kiểm tra tính năng **điểm xuất phát cố định**.

Input yêu cầu bắt đầu từ Hồ Hoàn Kiếm (ID: 5).

Kết quả: Địa điểm đầu tiên trong lịch trình đúng là Hồ Hoàn Kiếm.

✅ **PASSED** - Ràng buộc start point hoạt động đúng."

---

### Test Case 16: Must-visit Points (TC16)

> _[Chờ kết quả TC16 hiện ra]_

"**TC16** kiểm tra tính năng **địa điểm bắt buộc**.

Input yêu cầu phải ghé Lăng Bác (ID: 1) và Văn Miếu (ID: 2).

Kết quả: Cả hai địa điểm đều có trong lịch trình.

✅ **PASSED** - Ràng buộc must-visit hoạt động đúng."

---

### Tổng kết Test

> _[Chờ Summary hiện ra]_

"Tổng kết: **X/17 test cases PASSED**.

Các test cases bao gồm:

- Edge cases: Budget 0, thời gian cực ngắn
- Normal cases: Điều kiện tiêu chuẩn
- City cases: Test riêng cho Đà Nẵng
- Pace cases: So sánh tốc độ nhanh/chậm
- Algorithm cases: Performance test"

---

## PHẦN 5: DEMO TÍNH NĂNG NÂNG CAO (1-2 phút)

### 🎤 Lời thoại:

> _[Màn hình: Quay lại trình duyệt]_

"Cuối cùng, em sẽ demo các tính năng nâng cao."

---

### 5.1. Điểm xuất phát + Điểm bắt buộc

> _[Thao tác: Chọn Start Point = Café Giảng, Must Visit = Nhà tù Hỏa Lò, Văn Miếu]_

"Em chọn:

- Điểm xuất phát: **Café Giảng**
- Bắt buộc ghé: **Nhà tù Hỏa Lò** và **Văn Miếu**"

> _[Nhấn Lập kế hoạch]_

"Kết quả: Lịch trình bắt đầu từ Café Giảng, và bao gồm cả 2 địa điểm bắt buộc."

---

### 5.2. So sánh Pace

> _[Thao tác: Chạy 3 lần với pace = fast, normal, slow - cùng budget/time]_

"Khi đổi phong cách đi:

- **Fast** (Nhanh): Được nhiều địa điểm hơn vì thời gian mỗi chỗ giảm 30%
- **Slow** (Chậm): Được ít địa điểm hơn vì thời gian mỗi chỗ tăng 30%"

---

### 5.3. Lịch sử tìm kiếm

> _[Thao tác: Click vào menu History]_

"Trang **Lịch sử** lưu lại 10 lịch trình gần nhất bằng localStorage, không cần đăng nhập."

---

## PHẦN 6: KẾT LUẬN (30 giây)

### 🎤 Lời thoại:

> _[Màn hình: Slide kết luận hoặc trang chủ]_

"Tóm lại, em đã hoàn thành ứng dụng **Smart Travel Planner** với:

1. ✅ **Genetic Algorithm** hoàn chỉnh: Khởi tạo, Fitness, Selection, Crossover, Mutation
2. ✅ **Đa ràng buộc**: Ngân sách, Thời gian, Điểm bắt đầu, Điểm bắt buộc
3. ✅ **17 Test cases** tự động
4. ✅ **Giao diện hiện đại** với bản đồ tương tác

**Hướng phát triển:**

- Tích hợp Google Maps API tính khoảng cách thực
- Thêm nhiều thành phố và địa điểm
- Phát triển Mobile App

Cảm ơn thầy và các bạn đã theo dõi. Em rất mong nhận được góp ý từ thầy ạ!"

---

## 📝 GHI CHÚ KHI QUAY

### Mẹo quay tốt:

1. **Nói chậm, rõ ràng** - Không vội
2. **Zoom vào code** khi giải thích (Ctrl + = trong VS Code)
3. **Highlight dòng code** đang nói đến
4. **Pause 1-2 giây** giữa các phần để người xem theo kịp
5. **Quay thử 1 lần** trước khi quay chính thức

### Xử lý sự cố:

- **API lỗi?** → Restart backend: `uvicorn main:app --reload`
- **Test fail?** → Có thể do random, chạy lại
- **Nói nhầm?** → Quay lại đoạn đó, edit sau

### Cấu trúc video:

```
0:00 - Giới thiệu
1:00 - Demo giao diện
3:00 - Giải thích thuật toán
7:00 - Chạy test cases
9:00 - Demo tính năng nâng cao
10:00 - Kết luận
```

---

## 🔗 LINK THAM KHẢO

- **GitHub:** https://github.com/thanhkowibu/Smart-Travel-Planner
- **Backend:** http://localhost:8000
- **Frontend:** http://localhost:3000

---

_Script created for NCTN2 Demo - January 2026_
