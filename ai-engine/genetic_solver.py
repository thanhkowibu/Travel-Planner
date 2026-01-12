# ai-engine/genetic_solver.py
import random

# Cấu hình tham số thuật toán (Hyperparameters)
POPULATION_SIZE = 100   # Số lượng lịch trình trong một quần thể
GENERATIONS = 100       # Số lần tiến hóa (lặp lại)
MUTATION_RATE = 0.1    # Tỷ lệ đột biến (10%)

class GeneticSolver:
    def __init__(self, all_locations, budget, start_time, end_time, start_point=None, must_visit_ids=None, pace_modifier=1.0):
        self.all_locations = []
        self.start_point = start_point  # Location object
        self.must_visit_ids = must_visit_ids or [] # List of IDs
        
        for loc in all_locations:
            new_loc = loc.copy()
            new_loc['time_visit'] = int(loc['time_visit'] * pace_modifier)
            self.all_locations.append(new_loc)
            
        self.budget = budget
        self.max_time = (end_time - start_time) * 60
        self.pace_modifier = pace_modifier

    def calculate_fitness(self, individual):
        if not individual: return -1000
        
        total_rating = 0
        total_cost = 0
        total_time = 0
        visited_ids = set()
        
        # Kiểm tra điểm bắt đầu (nếu có quy định)
        if self.start_point and individual[0]['id'] != self.start_point['id']:
            return -10000 # Sai điểm bắt đầu là lỗi nặng

        # Kiểm tra các điểm bắt buộc
        must_visit_count = 0
        for loc in individual:
            if loc['id'] in visited_ids: return -9999
            visited_ids.add(loc['id'])
            
            total_rating += loc['rating']
            total_cost += loc['price']
            total_time += loc['time_visit']
            if loc['id'] in self.must_visit_ids:
                must_visit_count += 1

        # Phạt nặng nếu thiếu điểm bắt buộc
        missing_must_visit = len(self.must_visit_ids) - must_visit_count
        penalty = missing_must_visit * 50.0 # Mỗi điểm thiếu phạt 50 điểm fitness
        
        # Thêm buffer di chuyển
        travel_time_buffer = 20
        total_time += (len(individual) - 1) * travel_time_buffer

        # Các ràng buộc cũ
        if total_cost > self.budget:
            penalty += (total_cost - self.budget) * 0.1
        if total_time > self.max_time:
            penalty += (total_time - self.max_time) * 15.0
            
        return total_rating - penalty # Đơn giản hóa bonus để tập trung vào must-visit

    # 2. Tạo lịch trình ngẫu nhiên (Khởi tạo)
    def create_individual(self):
        # Lấy các điểm must-visit trước
        must_visits = [loc for loc in self.all_locations if loc['id'] in self.must_visit_ids]
        
        # Lấy các điểm còn lại (loại trừ start_point và must_visits để tránh trùng)
        exclude_ids = set(self.must_visit_ids)
        if self.start_point:
            exclude_ids.add(self.start_point['id'])
            
        remaining_pool = [loc for loc in self.all_locations if loc['id'] not in exclude_ids]
        
        # Chọn ngẫu nhiên số lượng địa điểm thêm vào
        k = random.randint(0, min(5, len(remaining_pool)))
        random_picks = random.sample(remaining_pool, k)
        
        # Kết hợp lại
        individual = must_visits + random_picks
        random.shuffle(individual) # Trộn để must-visit không luôn ở đầu
        
        # LUÔN chèn start_point vào vị trí đầu tiên
        if self.start_point:
            individual.insert(0, self.start_point)
            
        return individual

    # 3. Lai ghép (Crossover) - Single Point Crossover
    def crossover(self, parent1, parent2):
        if len(parent1) < 3 or len(parent2) < 3:
            return parent1, parent2
        
        # Không đụng vào index 0 (start_point)
        point = random.randint(2, min(len(parent1), len(parent2)) - 1)
        child1 = parent1[:point] + parent2[point:]
        child2 = parent2[:point] + parent1[point:]
        
        return child1, child2

    # 4. Đột biến (Mutation)
    def mutate(self, individual):
        if random.random() < MUTATION_RATE:
            # Không bao giờ đột biến index 0 nếu có start_point
            start_idx = 1 if self.start_point else 0
            if len(individual) <= start_idx: return individual

            mutation_type = random.random()
            idx = random.randint(start_idx, len(individual) - 1)

            if mutation_type < 0.5: # Thay thế
                new_loc = random.choice(self.all_locations)
                if new_loc['id'] != (self.start_point['id'] if self.start_point else None):
                    individual[idx] = new_loc
            elif mutation_type < 0.75: # Thêm
                new_loc = random.choice(self.all_locations)
                if new_loc not in individual:
                    individual.append(new_loc)
            else: # Xóa (tránh xóa must-visit)
                if len(individual) > start_idx + 1:
                    if individual[idx]['id'] not in self.must_visit_ids:
                        individual.pop(idx)
        
        return individual

    # 5. Hàm chạy chính (Main Loop)
    def solve(self):
        # Bước 1: Khởi tạo quần thể ban đầu
        population = [self.create_individual() for _ in range(POPULATION_SIZE)]

        for gen in range(GENERATIONS):
            # Bước 2: Đánh giá điểm số (Fitness)
            scored_population = [(ind, self.calculate_fitness(ind)) for ind in population]
            
            # Sắp xếp giảm dần theo điểm số (người giỏi nhất đứng đầu)
            scored_population.sort(key=lambda x: x[1], reverse=True)
            
            # In ra log để xem AI đang học thế nào (chỉ in gen đầu và cuối)
            if gen == 0 or gen == GENERATIONS - 1:
                best_score = scored_population[0][1]
                print(f"Gen {gen}: Best Score = {best_score}")

            # Chọn ra top 50% cá thể tốt nhất để làm bố mẹ
            top_half = [x[0] for x in scored_population[:POPULATION_SIZE // 2]]
            
            # Bước 3: Tạo thế hệ mới
            new_population = []
            while len(new_population) < POPULATION_SIZE:
                # Chọn ngẫu nhiên 2 bố mẹ từ top tốt nhất
                p1 = random.choice(top_half)
                p2 = random.choice(top_half)
                
                # Lai ghép
                c1, c2 = self.crossover(p1, p2)
                
                # Đột biến
                c1 = self.mutate(c1)
                c2 = self.mutate(c2)
                
                new_population.extend([c1, c2])
            
            population = new_population

        # Trả về lịch trình tốt nhất sau cùng
        final_ranking = [(ind, self.calculate_fitness(ind)) for ind in population]
        final_ranking.sort(key=lambda x: x[1], reverse=True)
        
        # Lọc bỏ các địa điểm trùng lặp trong kết quả cuối cùng (cleanup)
        best_itinerary = []
        seen_ids = set()
        for loc in final_ranking[0][0]:
            if loc['id'] not in seen_ids:
                best_itinerary.append(loc)
                seen_ids.add(loc['id'])

        # --- CODE MỚI THÊM VÀO: CẮT GỌT NẾU VẪN LỐ ---
        
        # Tính lại tổng thời gian và chi phí thực tế
        current_cost = sum(loc['price'] for loc in best_itinerary)
        current_time = sum(loc['time_visit'] for loc in best_itinerary)

        # Vòng lặp cắt bỏ: Nếu lố tiền hoặc lố giờ, bỏ bớt địa điểm rating thấp nhất
        travel_time_buffer = 20
        while len(best_itinerary) > 0:
            current_cost = sum(loc['price'] for loc in best_itinerary)
            # Tính lại total_time bao gồm buffer di chuyển
            current_time = sum(loc['time_visit'] for loc in best_itinerary) + (len(best_itinerary) - 1) * travel_time_buffer if len(best_itinerary) > 0 else 0

            if current_cost <= self.budget and current_time <= self.max_time:
                break
                
            # Tìm địa điểm có rating thấp nhất để loại bỏ (Ưu tiên bỏ điểm KHÔNG bắt buộc)
            min_rating_index = -1
            
            # B1: Thử tìm điểm rating thấp nhất trong nhóm KHÔNG phải must-visit và KHÔNG phải start_point
            start_idx = 1 if self.start_point else 0
            for i in range(start_idx, len(best_itinerary)):
                if best_itinerary[i]['id'] not in self.must_visit_ids:
                    if min_rating_index == -1 or best_itinerary[i]['rating'] < best_itinerary[min_rating_index]['rating']:
                        min_rating_index = i
            
            # B2: Nếu không tìm thấy (tức là toàn điểm must-visit), thì đành phải bỏ điểm must-visit thấp nhất
            if min_rating_index == -1:
                for i in range(start_idx, len(best_itinerary)):
                    if min_rating_index == -1 or best_itinerary[i]['rating'] < best_itinerary[min_rating_index]['rating']:
                        min_rating_index = i
            
            # B3: Nếu vẫn không có điểm nào để bỏ (chỉ còn start_point), break luôn
            if min_rating_index == -1:
                break
                
            removed_item = best_itinerary.pop(min_rating_index)
            print(f"⚠️ Đã cắt bỏ {removed_item['name']} để đảm bảo ràng buộc.")

        # --- LOGIC CỨU HỘ (RESCUE) ---
        # Nếu sau khi cắt gọt mà danh sách bị rỗng (do cắt hết hoặc do AI chọn rỗng)
        if not best_itinerary:
            # Tìm trong kho dữ liệu MỘT địa điểm duy nhất có Rating cao nhất
            # mà thỏa mãn Budget và Time
            best_single_location = None
            best_rating = -1

            for loc in self.all_locations:
                if loc['price'] <= self.budget and loc['time_visit'] <= self.max_time:
                    if loc['rating'] > best_rating:
                        best_rating = loc['rating']
                        best_single_location = loc
            
            # Nếu tìm thấy ứng viên phù hợp, đưa nó vào list
            if best_single_location:
                best_itinerary.append(best_single_location)

        return best_itinerary