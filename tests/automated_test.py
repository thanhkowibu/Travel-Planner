"""
Automated Test Runner for Smart Travel Planner
Chạy tất cả test cases và generate report
"""

import json
import requests
import time
from datetime import datetime
from typing import Dict, List, Any

# Configuration
API_URL = "http://localhost:8000/optimize"
TEST_CASES_FILE = "test_cases.json"
REPORT_FILE = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def load_test_cases() -> List[Dict[str, Any]]:
    """Load test cases from JSON file"""
    with open(TEST_CASES_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['test_cases']

def run_single_test(test_case: Dict[str, Any]) -> Dict[str, Any]:
    """Run a single test case"""
    test_id = test_case['id']
    test_name = test_case['name']
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}Test {test_id}: {test_name}{Colors.RESET}")
    print(f"Mô tả: {test_case['description']}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")
    
    # Handle multiple inputs (for comparison tests)
    if isinstance(test_case['input'], list):
        results = []
        for idx, input_data in enumerate(test_case['input']):
            print(f"\n  Sub-test {idx + 1}/{len(test_case['input'])}: {input_data['pace']}")
            result = run_api_call(input_data)
            results.append(result)
        return {
            'test_id': test_id,
            'test_name': test_name,
            'results': results,
            'status': 'completed'
        }
    else:
        # Single input
        result = run_api_call(test_case['input'])
        passed = validate_result(result, test_case['expected'], test_case['input'])
        
        return {
            'test_id': test_id,
            'test_name': test_name,
            'input': test_case['input'],
            'result': result,
            'expected': test_case['expected'],
            'passed': passed,
            'status': 'completed'
        }

def run_api_call(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Make API call and measure time"""
    start_time = time.time()
    
    try:
        response = requests.post(
            API_URL,
            json=input_data,
            timeout=30
        )
        execution_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            return {
                'success': True,
                'data': data,
                'execution_time': execution_time,
                'status_code': 200
            }
        else:
            return {
                'success': False,
                'error': f"HTTP {response.status_code}",
                'execution_time': execution_time,
                'status_code': response.status_code
            }
    except Exception as e:
        execution_time = time.time() - start_time
        return {
            'success': False,
            'error': str(e),
            'execution_time': execution_time
        }

def validate_result(result: Dict[str, Any], expected: Dict[str, Any], input_data: Dict[str, Any]) -> bool:
    """Validate if result meets expectations"""
    if not result['success']:
        print(f"  {Colors.RED}❌ API call failed: {result.get('error', 'Unknown')}{Colors.RESET}")
        return False
    
    data = result['data']
    
    if data.get('status') != 'success':
        print(f"  {Colors.RED}❌ Algorithm failed: {data.get('message', 'Unknown')}{Colors.RESET}")
        return False
    
    itinerary_result = data['result']
    checks_passed = []
    checks_failed = []
    
    # Check min_locations
    if 'min_locations' in expected:
        actual = itinerary_result['location_count']
        expected_min = expected['min_locations']
        if actual >= expected_min:
            checks_passed.append(f"Locations: {actual} >= {expected_min} ✓")
        else:
            checks_failed.append(f"Locations: {actual} < {expected_min} ✗")
    
    # Check max_locations
    if 'max_locations' in expected:
        actual = itinerary_result['location_count']
        expected_max = expected['max_locations']
        if actual <= expected_max:
            checks_passed.append(f"Locations: {actual} <= {expected_max} ✓")
        else:
            checks_failed.append(f"Locations: {actual} > {expected_max} ✗")
    
    # Check max_cost
    if 'max_cost' in expected:
        actual = itinerary_result['total_cost']
        expected_max = expected['max_cost']
        if actual <= expected_max:
            checks_passed.append(f"Cost: {actual:,}đ <= {expected_max:,}đ ✓")
        else:
            checks_failed.append(f"Cost: {actual:,}đ > {expected_max:,}đ ✗")
    
    # Check max_duration
    if 'max_duration_minutes' in expected:
        actual = itinerary_result['total_duration_minutes']
        expected_max = expected['max_duration_minutes']
        if actual <= expected_max:
            checks_passed.append(f"Duration: {actual}m <= {expected_max}m ✓")
        else:
            checks_failed.append(f"Duration: {actual}m > {expected_max}m ✗")
    
    # Check max_execution time
    if 'max_execution_time_seconds' in expected:
        actual = result['execution_time']
        expected_max = expected['max_execution_time_seconds']
        if actual <= expected_max:
            checks_passed.append(f"Exec time: {actual:.2f}s <= {expected_max}s ✓")
        else:
            checks_failed.append(f"Exec time: {actual:.2f}s > {expected_max}s ✗")
            
    # --- LOGIC MỚI: Check Start Point ---
    if 'start_point_id' in input_data:
        expected_start_id = input_data['start_point_id']
        actual_start_id = itinerary_result['itinerary'][0]['id'] if itinerary_result['itinerary'] else None
        if actual_start_id == expected_start_id:
            checks_passed.append(f"Start Point ID: {actual_start_id} == {expected_start_id} ✓")
        else:
            checks_failed.append(f"Start Point ID: {actual_start_id} != {expected_start_id} ✗")

    # --- LOGIC MỚI: Check Must Visit Points ---
    if 'must_visit_ids' in input_data and input_data['must_visit_ids']:
        expected_must_ids = set(input_data['must_visit_ids'])
        actual_ids = set(loc['id'] for loc in itinerary_result['itinerary'])
        missing_ids = expected_must_ids - actual_ids
        
        if not missing_ids:
            checks_passed.append(f"Must Visit Points: All included ✓")
        else:
            checks_failed.append(f"Must Visit Points: Missing {list(missing_ids)} ✗")
    
    # Print results
    print(f"\n  {Colors.BOLD}Kết quả:{Colors.RESET}")
    print(f"  - Số địa điểm: {itinerary_result['location_count']}")
    print(f"  - Tổng chi phí: {itinerary_result['total_cost']:,}đ")
    print(f"  - Tổng thời gian: {itinerary_result['total_duration_minutes']}m")
    print(f"  - Thời gian chạy: {result['execution_time']:.2f}s")
    
    if expected.get('note'):
        print(f"\n  {Colors.YELLOW}📝 Note: {expected['note']}{Colors.RESET}")
    
    print(f"\n  {Colors.BOLD}Validation:{Colors.RESET}")
    for check in checks_passed:
        print(f"  {Colors.GREEN}✓ {check}{Colors.RESET}")
    for check in checks_failed:
        print(f"  {Colors.RED}✗ {check}{Colors.RESET}")
    
    passed = len(checks_failed) == 0
    
    if passed:
        print(f"\n  {Colors.GREEN}{Colors.BOLD}✅ PASSED{Colors.RESET}")
    else:
        print(f"\n  {Colors.RED}{Colors.BOLD}❌ FAILED{Colors.RESET}")
    
    return passed

def generate_report(results: List[Dict[str, Any]]):
    """Generate and save test report"""
    total = len(results)
    passed = sum(1 for r in results if r.get('passed', False))
    failed = total - passed
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'total': total,
            'passed': passed,
            'failed': failed,
            'pass_rate': f"{(passed/total*100):.1f}%" if total > 0 else "0%"
        },
        'results': results
    }
    
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"Total tests: {total}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed}{Colors.RESET}")
    print(f"Pass rate: {report['summary']['pass_rate']}")
    print(f"\nReport saved to: {Colors.BLUE}{REPORT_FILE}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")

def main():
    """Main test runner"""
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}Smart Travel Planner - Automated Test Runner{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
    
    # Check API availability
    print("Checking API availability...")
    try:
        response = requests.get("http://localhost:8000/locations", timeout=5)
        if response.status_code == 200:
            print(f"{Colors.GREEN}✓ API server is running{Colors.RESET}\n")
        else:
            print(f"{Colors.RED}✗ API returned status {response.status_code}{Colors.RESET}")
            return
    except Exception as e:
        print(f"{Colors.RED}✗ Cannot connect to API: {e}{Colors.RESET}")
        print(f"{Colors.YELLOW}Please start the API server first:{Colors.RESET}")
        print("  cd ai-engine")
        print("  uvicorn main:app --reload --port 8000\n")
        return
    
    # Load test cases
    print("Loading test cases...")
    try:
        test_cases = load_test_cases()
        print(f"{Colors.GREEN}✓ Loaded {len(test_cases)} test cases{Colors.RESET}")
    except Exception as e:
        print(f"{Colors.RED}✗ Failed to load test cases: {e}{Colors.RESET}")
        return
    
    # Run tests
    results = []
    for idx, test_case in enumerate(test_cases, 1):
        print(f"\n{Colors.BOLD}Running test {idx}/{len(test_cases)}...{Colors.RESET}")
        result = run_single_test(test_case)
        results.append(result)
        time.sleep(0.5)  # Delay between tests
    
    # Generate report
    generate_report(results)

if __name__ == "__main__":
    main()

