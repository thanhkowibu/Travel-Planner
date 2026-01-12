import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from genetic_solver import GeneticSolver

app = FastAPI()

# 1. Cấu hình CORS (Cho phép Next.js gọi sang)
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Hàm tiện ích để đọc file JSON
def load_locations():
    # Lấy đường dẫn tuyệt đối đến file json để tránh lỗi path
    base_path = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_path, "..", "data", "locations.json")
    
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)

# 3. API trả về danh sách địa điểm
@app.get("/locations")
def get_locations():
    data = load_locations()
    return data

# 4. API lọc theo thành phố (Ví dụ: /locations/Hanoi)
@app.get("/locations/{city_name}")
def get_locations_by_city(city_name: str):
    all_data = load_locations()
    # Lọc dữ liệu (Case insensitive)
    filtered = [loc for loc in all_data if loc["city"].lower() == city_name.lower()]
    return filtered

from pydantic import BaseModel

# Định nghĩa cấu trúc dữ liệu gửi lên từ Frontend
class TripRequest(BaseModel):
    city: str          # Ví dụ: "Hanoi"
    budget: float      # Ví dụ: 500000
    start_time: float  # Giờ bắt đầu (8.0 = 8h sáng)
    end_time: float    # Giờ kết thúc (18.0 = 6h chiều)
    interests: List[str] = [] # Sở thích: ["history", "food"]
    pace: str = "normal" # Mặc định là bình thường (slow | normal | fast)
    start_point_id: Optional[int] = None   # ID của địa điểm bắt đầu
    must_visit_ids: List[int] = [] # Danh sách ID bắt buộc đi

# API nhận yêu cầu lập lịch
@app.post("/optimize")
def optimize_schedule(request: TripRequest):
    print(f"🚀 Bắt đầu tính toán cho: {request.city}, Budget: {request.budget}, Tốc độ: {request.pace}")
    
    # 1. Load toàn bộ dữ liệu
    all_locations = load_locations()
    
    # 2. Lọc sơ bộ: Chỉ lấy địa điểm thuộc thành phố user chọn
    city_locations = [
        loc for loc in all_locations 
        if loc["city"].lower() == request.city.lower()
    ]
    
    if not city_locations:
        return {"status": "error", "message": "Không tìm thấy địa điểm nào ở thành phố này"}

    # 3. Map từ string sang số (Hệ số nhân)
    pace_map = {
        "fast": 0.7,   # Đi nhanh (giảm 30% thời gian)
        "normal": 1.0, # Giữ nguyên
        "slow": 1.3    # Đi chậm (tăng 30% thời gian)
    }
    # Lấy hệ số, nếu không khớp thì mặc định là 1.0
    modifier = pace_map.get(request.pace.lower(), 1.0)

    # 4. Tìm đối tượng Start Point từ ID (nếu có)
    start_point_obj = None
    if request.start_point_id:
        for loc in city_locations:
            if loc["id"] == request.start_point_id:
                start_point_obj = loc
                break

    # 5. Khởi tạo và chạy thuật toán Genetic
    solver = GeneticSolver(
        all_locations=city_locations,
        budget=request.budget,
        start_time=request.start_time,
        end_time=request.end_time,
        start_point=start_point_obj,
        must_visit_ids=request.must_visit_ids,
        pace_modifier=modifier
    )
    
    best_itinerary = solver.solve()
    
    # 5. Tính toán tổng kết để trả về
    total_cost = sum(loc['price'] for loc in best_itinerary)
    total_time = sum(loc['time_visit'] for loc in best_itinerary) # Đơn vị phút

    return {
        "status": "success",
        "result": {
            "itinerary": best_itinerary,
            "total_cost": total_cost,
            "total_duration_minutes": total_time,
            "location_count": len(best_itinerary)
        }
    }