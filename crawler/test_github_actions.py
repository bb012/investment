#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub Actions 환경에서 크롤러 테스트
"""

import os
import sys
import json
from datetime import datetime

def test_github_actions_environment():
    """GitHub Actions 환경 테스트"""
    print("=== GitHub Actions 환경 테스트 ===")
    
    # 환경 변수 확인
    print(f"GITHUB_ACTIONS: {os.environ.get('GITHUB_ACTIONS', 'false')}")
    print(f"GITHUB_RUN_ID: {os.environ.get('GITHUB_RUN_ID', 'N/A')}")
    print(f"GITHUB_WORKFLOW: {os.environ.get('GITHUB_WORKFLOW', 'N/A')}")
    
    # 현재 디렉토리 확인
    print(f"현재 디렉토리: {os.getcwd()}")
    print(f"디렉토리 내용: {os.listdir('.')}")
    
    # Python 환경 확인
    print(f"Python 버전: {sys.version}")
    print(f"Python 경로: {sys.executable}")
    
    # 데이터 디렉토리 생성 테스트
    data_dir = "data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"✅ 데이터 디렉토리 생성: {data_dir}")
    else:
        print(f"📁 데이터 디렉토리 존재: {data_dir}")
    
    # 테스트 데이터 생성
    test_data = {
        "timestamp": datetime.now().isoformat(),
        "test": True,
        "environment": "github-actions",
        "message": "GitHub Actions 환경 테스트 성공"
    }
    
    test_file = os.path.join(data_dir, "test_data.json")
    with open(test_file, 'w', encoding='utf-8') as f:
        json.dump(test_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 테스트 데이터 파일 생성: {test_file}")
    
    # 파일 내용 확인
    with open(test_file, 'r', encoding='utf-8') as f:
        content = json.load(f)
        print(f"📄 파일 내용: {content}")
    
    print("=== 테스트 완료 ===")
    return True

if __name__ == "__main__":
    test_github_actions_environment()
