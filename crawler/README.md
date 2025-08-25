# 주식 데이터 크롤링 시스템

## 📋 개요

이 시스템은 매일 새벽 1시에 자동으로 주식 데이터를 크롤링하여 웹페이지를 업데이트하는 자동화 시스템입니다.

## 🏗️ 시스템 구조

```
investment/
├── crawler/                 # 크롤링 시스템
│   ├── stock_crawler.py    # 메인 크롤러
│   ├── test_crawler.py     # 테스트 스크립트
│   ├── run_crawler.bat     # Windows 실행 배치 파일
│   ├── requirements.txt    # Python 의존성
│   └── README.md          # 이 파일
├── data/                   # 크롤링된 데이터 저장소
│   ├── latest_stock_data.json     # 최신 데이터
│   └── stock_data_YYYYMMDD.json   # 일일 데이터
├── assets/                 # 웹페이지 자원
│   ├── js/                # JavaScript 파일들
│   └── css/               # CSS 파일들
└── *.html                 # 웹페이지들
```

## 🚀 주요 기능

### 1. **자동 데이터 수집**
- **주식 정보**: 6개 주요 종목의 실시간 가격, 변동률, 거래량, 시가총액
  - 삼성전자 (005930), 대한항공 (003490), 와이지엔터테인먼트 (122870)
  - 한화에어로스페이스 (012450), 현대차 (005380), 농심 (004370)
- **시장 지수**: KOSPI, KOSDAQ 실시간 지수 및 변동
- **경제 뉴스**: 네이버 경제 뉴스 상위 10개
- **과거 데이터**: 30일간의 주가 차트 데이터

### 2. **자동 실행 스케줄링**
- GitHub Actions를 통한 매일 새벽 1시 자동 실행
- GitHub Actions 탭에서 실시간 실행 상태 모니터링
- 오류 발생 시 자동 복구 및 폴백 데이터 제공

### 3. **웹페이지 자동 업데이트**
- 크롤링된 데이터를 웹페이지에 실시간 반영
- 차트, 지수, 뉴스 등 모든 정보 자동 업데이트
- 데이터 로드 실패 시 기본 데이터로 폴백

## 🛠️ 설치 및 설정

### 1. **GitHub Actions 자동 실행 (권장)**
- **자동 스케줄**: 매일 새벽 1시 (UTC 기준, 한국 시간 새벽 10시)
- **수동 실행**: GitHub 저장소의 Actions 탭에서 "Run workflow" 클릭
- **자동 커밋**: 크롤링된 데이터가 자동으로 저장소에 커밋됨

### 2. **로컬 환경 설정 (선택사항)**
```bash
# Python 3.8 이상 설치 필요
python --version

# 가상환경 생성 (권장)
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# 의존성 설치
pip install -r requirements.txt
```

### 3. **크롤러 테스트**
```bash
cd crawler
python test_github_actions.py  # GitHub Actions 환경 테스트
```

## 📊 데이터 형식

### 주식 데이터 (JSON)
```json
{
  "timestamp": "2024-01-15T01:00:00",
  "stocks": [
    {
      "code": "005930",
      "name": "삼성전자",
      "market": "KOSPI",
      "current_price": 75000,
      "change_amount": 1500,
      "change_percent": 2.04,
      "volume": 15000000,
      "market_cap": 450000
    }
  ],
  "market_indices": {
    "kospi": {
      "value": 2450.50,
      "change": 15.50,
      "timestamp": "2024-01-15T01:00:00"
    }
  },
  "news": [
    {
      "title": "경제 뉴스 제목",
      "link": "https://news.naver.com/...",
      "timestamp": "2024-01-15T01:00:00"
    }
  ],
  "historical_data": {
    "005930": [
      {
        "date": "2024-01-14",
        "price": 74800,
        "volume": 12000000
      }
    ]
  }
}
```

## 🔧 크롤러 설정

### 주요 설정 항목
- **종목 리스트**: `stock_list` 변수에서 수정 가능
- **크롤링 간격**: 서버 부하 방지를 위한 딜레이 설정
- **데이터 보관 기간**: 기본 7일 (설정 가능)
- **로그 레벨**: INFO, WARNING, ERROR

### 커스터마이징
```python
# 종목 추가/수정
self.stock_list.append({
    "code": "새종목코드",
    "name": "새종목명",
    "market": "KOSPI"
})

# 크롤링 간격 조정
time.sleep(random.uniform(1, 3))  # 1-3초 랜덤 딜레이

# 데이터 보관 기간 조정
self.cleanup_old_data(days_to_keep=30)  # 30일 보관
```

## 📈 웹페이지 연동

### JavaScript에서 데이터 로드
```javascript
// 크롤링된 데이터 로드
async loadStockData(stockCode) {
    try {
        const response = await fetch('../data/latest_stock_data.json');
        const data = await response.json();
        
        // 데이터 처리
        this.processStockData(data);
    } catch (error) {
        // 폴백 데이터 사용
        this.loadDefaultData();
    }
}
```

### 폴백 시스템
- 크롤링 데이터 로드 실패 시 기본 데이터 자동 사용
- 네트워크 오류, 파일 없음 등 모든 상황 대응
- 사용자 경험 지속성 보장

## 🚨 문제 해결

### 일반적인 문제들

#### 1. **크롤러 실행 실패**
```bash
# 로그 확인
type crawler.log

# Python 경로 확인
python --version
pip list

# 의존성 재설치
pip install -r requirements.txt --force-reinstall
```

#### 2. **데이터 파일 생성 안됨**
- `data` 폴더 권한 확인
- Python 실행 경로 확인
- 네트워크 연결 상태 확인

#### 3. **웹페이지에서 데이터 로드 안됨**
- 브라우저 개발자 도구에서 오류 확인
- 파일 경로 정확성 확인
- CORS 설정 확인

#### 4. **GitHub Actions 실행 안됨**
- GitHub Actions 탭에서 워크플로우 활성화 상태 확인
- 저장소 권한 및 Actions 권한 확인
- cron 스케줄 설정 확인

## 📝 로그 및 모니터링

### 로그 확인
- **GitHub Actions**: Actions 탭에서 실시간 실행 로그 확인
- **로컬 환경**: `crawler/crawler.log` 파일에서 로그 확인
- **내용**: 실행 시간, 성공/실패 상태, 오류 메시지

### 모니터링 포인트
1. **GitHub Actions 탭에서 매일 새벽 1시 자동 실행 확인**
2. **데이터 파일 생성 및 자동 커밋 확인**
3. **웹페이지 데이터 업데이트 확인**
4. **Actions 실행 로그 및 오류 모니터링**

## 🔒 보안 및 주의사항

### 웹 크롤링 주의사항
- **봇 차단 방지**: User-Agent 헤더 설정
- **요청 간격**: 서버 부하 방지를 위한 딜레이
- **에러 처리**: 네트워크 오류 시 재시도 로직

### 데이터 보안
- **민감 정보**: API 키 등은 별도 설정 파일로 관리
- **접근 권한**: 데이터 폴더 접근 권한 제한
- **백업**: 중요 데이터 정기 백업

## 📞 지원 및 문의

### 문제 발생 시
1. **GitHub Actions**: Actions 탭에서 실행 로그 및 오류 확인
2. **로컬 환경**: `crawler.log` 파일에서 오류 확인
3. **테스트**: `test_github_actions.py` 실행하여 환경 테스트
4. **네트워크**: 외부 사이트 접근 가능 여부 확인

### 추가 기능 요청
- 새로운 데이터 소스 추가
- 크롤링 주기 조정
- 웹페이지 기능 확장

---

**마지막 업데이트**: 2024년 1월 15일  
**버전**: 2.0.0 (GitHub Actions 기반)  
**작성자**: 투자 분석 시스템 개발팀
