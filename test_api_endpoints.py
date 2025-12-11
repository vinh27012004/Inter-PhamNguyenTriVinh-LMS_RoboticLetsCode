"""
Test script for new API endpoints
Kiểm tra tất cả endpoints mới đã tạo
"""
import requests
import json
from pprint import pprint

BASE_URL = "http://127.0.0.1:8000/api/content"

def test_api(endpoint, description):
    """Test một API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n{'='*60}")
    print(f"🧪 Testing: {description}")
    print(f"URL: {url}")
    print('='*60)
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Response keys: {list(data.keys())}")
            
            # Hiển thị sample data
            if 'results' in data:
                print(f"Total count: {data.get('count', 'N/A')}")
                if data['results']:
                    print(f"First item sample:")
                    pprint(data['results'][0], depth=2)
            else:
                print("Data sample:")
                pprint(data, depth=2)
        else:
            print(f"❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print(" 🚀 TESTING NEW API ENDPOINTS")
    print("="*60)
    
    # Test Media API
    test_api("/media/", "Media Library - List all media")
    test_api("/media/?media_type=IMAGE", "Media - Filter by type IMAGE")
    
    # Test Lesson Content APIs
    test_api("/objectives/", "Lesson Objectives - List all")
    test_api("/models/", "Lesson Models - List all")
    test_api("/preparations/", "Preparations - List all")
    test_api("/build-blocks/", "Build Blocks - List all")
    test_api("/content-blocks/", "Content Blocks - List all")
    test_api("/attachments/", "Attachments - List all")
    test_api("/challenges/", "Challenges - List all")
    
    # Test Quiz APIs
    test_api("/quizzes/", "Quizzes - List all")
    test_api("/quiz-submissions/", "Quiz Submissions - User submissions (requires auth)")
    
    # Test Composite API
    test_api("/lesson-details/", "Lesson Details - Full lesson content (requires auth)")
    
    # Test with filters
    test_api("/objectives/?objective_type=KNOWLEDGE", "Objectives - Filter by KNOWLEDGE type")
    test_api("/build-blocks/?block_type=HARDWARE", "Build Blocks - Filter by HARDWARE")
    test_api("/challenges/?difficulty_level=MEDIUM", "Challenges - Filter by MEDIUM difficulty")
    
    # Test search
    test_api("/media/?search=robot", "Media - Search 'robot'")
    
    print("\n" + "="*60)
    print("✅ All tests completed!")
    print("="*60)


def test_specific_lesson():
    """Test lấy full content của 1 lesson cụ thể"""
    print("\n" + "="*60)
    print("🔍 Testing Specific Lesson Detail")
    print("="*60)
    
    # Lấy danh sách lessons trước
    lessons_url = f"{BASE_URL}/lessons/"
    response = requests.get(lessons_url)
    
    if response.status_code == 200:
        data = response.json()
        if data['results']:
            lesson = data['results'][0]
            lesson_slug = lesson['slug']
            
            print(f"\nTesting lesson: {lesson['title']} (slug: {lesson_slug})")
            
            # Test lesson detail với full content
            detail_url = f"{BASE_URL}/lesson-details/{lesson_slug}/"
            print(f"URL: {detail_url}")
            print("Note: This requires authentication")
            
            # Nếu có token, test luôn
            # response = requests.get(detail_url, headers={'Authorization': 'Token <your-token>'})
        else:
            print("No lessons found in database")
    else:
        print(f"Failed to get lessons list: {response.status_code}")


if __name__ == "__main__":
    main()
    test_specific_lesson()

