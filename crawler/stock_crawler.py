#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
주식 데이터 크롤링 스크립트
매일 새벽 1시에 실행되어 주식 정보를 수집하고 JSON 파일로 저장
"""

import requests
import json
import time
import logging
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import random
import os

# 로깅 설정
def setup_logging():
    """로깅 설정 - GitHub Actions 환경에 따라 다르게 설정"""
    if os.environ.get('GITHUB_ACTIONS', 'false').lower() == 'true':
        # GitHub Actions에서는 콘솔 출력만
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler()
            ]
        )
    else:
        # 로컬 환경에서는 파일과 콘솔 모두
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('crawler.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )

# 로깅 설정 실행
setup_logging()

class StockDataCrawler:
    def __init__(self):
        self.base_url = "https://finance.naver.com"
        # GitHub Actions 환경에서는 현재 디렉토리 기준으로 설정
        self.data_dir = os.environ.get('DATA_DIR', 'data' if os.path.exists("data") else "../data")
        self.ensure_data_directory()
        
        # GitHub Actions 환경 감지
        self.is_github_actions = os.environ.get('GITHUB_ACTIONS', 'false').lower() == 'true'
        
        # 주요 종목 리스트 (KOSPI, KOSDAQ)
        self.stock_list = [
            {"code": "005930", "name": "삼성전자", "market": "KOSPI"},
            {"code": "000660", "name": "SK하이닉스", "market": "KOSPI"},
            {"code": "035420", "name": "NAVER", "market": "KOSPI"},
            {"code": "051910", "name": "LG화학", "market": "KOSPI"},
            {"code": "006400", "name": "삼성SDI", "market": "KOSPI"},
            {"code": "207940", "name": "삼성바이오로직스", "market": "KOSPI"},
            {"code": "068270", "name": "셀트리온", "market": "KOSPI"},
            {"code": "323410", "name": "카카오뱅크", "market": "KOSPI"},
            {"code": "035720", "name": "카카오", "market": "KOSPI"},
            {"code": "086790", "name": "하나금융지주", "market": "KOSPI"},
            {"code": "105560", "name": "KB금융", "market": "KOSPI"},
            {"code": "055550", "name": "신한지주", "market": "KOSPI"},
            {"code": "139480", "name": "이마트", "market": "KOSPI"},
            {"code": "028260", "name": "삼성물산", "market": "KOSPI"},
            {"code": "017670", "name": "SK텔레콤", "market": "KOSPI"},
            {"code": "015760", "name": "한국전력", "market": "KOSPI"},
            {"code": "010950", "name": "S-Oil", "market": "KOSPI"},
            {"code": "096770", "name": "SK이노베이션", "market": "KOSPI"},
            {"code": "034020", "name": "두산에너빌리티", "market": "KOSPI"},
            {"code": "373220", "name": "LG에너지솔루션", "market": "KOSPI"}
        ]
        
        # 헤더 설정 (봇 차단 방지)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    
    def ensure_data_directory(self):
        """데이터 디렉토리 생성"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            logging.info(f"데이터 디렉토리 생성: {self.data_dir}")
    
    def get_stock_price(self, stock_code):
        """개별 종목의 현재가 정보 수집"""
        try:
            url = f"{self.base_url}/item/main.naver?code={stock_code}"
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 현재가 추출
            price_element = soup.select_one('div.today p.no_today span.blind')
            if price_element:
                current_price = price_element.get_text(strip=True).replace(',', '')
                current_price = int(current_price) if current_price.isdigit() else 0
            else:
                current_price = 0
            
            # 전일 대비 변동 추출
            change_element = soup.select_one('div.today p.no_exday em span.blind')
            if change_element:
                change_text = change_element.get_text(strip=True)
                change_amount = 0
                change_percent = 0
                
                if '상승' in change_text or '하락' in change_text:
                    # 변동금액과 변동률 추출
                    amount_element = soup.select_one('div.today p.no_exday em span.blind + span')
                    if amount_element:
                        amount_text = amount_element.get_text(strip=True)
                        change_amount = int(amount_text.replace(',', '').replace('+', '').replace('-', ''))
                        
                        # 변동률 추출
                        percent_element = soup.select_one('div.today p.no_exday em span.blind + span + span')
                        if percent_element:
                            percent_text = percent_element.get_text(strip=True)
                            change_percent = float(percent_text.replace('%', '').replace('+', '').replace('-', ''))
            else:
                change_amount = 0
                change_percent = 0
            
            # 거래량 추출
            volume_element = soup.select_one('table.type5 tr:nth-child(2) td:nth-child(3)')
            if volume_element:
                volume_text = volume_element.get_text(strip=True).replace(',', '')
                volume = int(volume_text) if volume_text.isdigit() else 0
            else:
                volume = 0
            
            # 시가총액 추출
            market_cap_element = soup.select_one('table.type5 tr:nth-child(1) td:nth-child(2)')
            if market_cap_element:
                market_cap_text = market_cap_element.get_text(strip=True).replace(',', '').replace('억원', '')
                market_cap = float(market_cap_text) if market_cap_text.replace('.', '').isdigit() else 0
            else:
                market_cap = 0
            
            return {
                "code": stock_code,
                "current_price": current_price,
                "change_amount": change_amount,
                "change_percent": change_percent,
                "volume": volume,
                "market_cap": market_cap,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"종목 {stock_code} 정보 수집 실패: {str(e)}")
            return None
    
    def get_market_indices(self):
        """주요 지수 정보 수집"""
        try:
            # KOSPI
            kospi_url = "https://finance.naver.com/sise/sise_index.nhn?code=KOSPI"
            response = requests.get(kospi_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # KOSPI 현재값
            kospi_element = soup.select_one('div.head_area span.value')
            kospi_value = 0
            if kospi_element:
                kospi_text = kospi_element.get_text(strip=True).replace(',', '')
                kospi_value = float(kospi_text) if kospi_text.replace('.', '').isdigit() else 0
            
            # KOSPI 변동
            kospi_change_element = soup.select_one('div.head_area span.change')
            kospi_change = 0
            if kospi_change_element:
                kospi_text = kospi_change_element.get_text(strip=True).replace(',', '').replace('+', '').replace('-', '')
                kospi_change = float(kospi_text) if kospi_text.replace('.', '').isdigit() else 0
            
            # KOSDAQ
            kosdaq_url = "https://finance.naver.com/sise/sise_index.nhn?code=KOSDAQ"
            response = requests.get(kosdaq_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # KOSDAQ 현재값
            kosdaq_element = soup.select_one('div.head_area span.value')
            kosdaq_value = 0
            if kosdaq_element:
                kosdaq_text = kosdaq_element.get_text(strip=True).replace(',', '')
                kosdaq_value = float(kosdaq_text) if kosdaq_text.replace('.', '').isdigit() else 0
            
            # KOSDAQ 변동
            kosdaq_change_element = soup.select_one('div.head_area span.change')
            kosdaq_change = 0
            if kosdaq_change_element:
                kosdaq_text = kosdaq_change_element.get_text(strip=True).replace(',', '').replace('+', '').replace('-', '')
                kosdaq_change = float(kosdaq_text) if kosdaq_text.replace('.', '').isdigit() else 0
            
            return {
                "kospi": {
                    "value": kospi_value,
                    "change": kospi_change,
                    "timestamp": datetime.now().isoformat()
                },
                "kosdaq": {
                    "value": kosdaq_value,
                    "change": kosdaq_change,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logging.error(f"지수 정보 수집 실패: {str(e)}")
            return None
    
    def get_economic_news(self):
        """경제 뉴스 수집"""
        try:
            # 네이버 경제 뉴스
            news_url = "https://news.naver.com/main/main.naver?mode=LSD&mid=shm&sid1=101"
            response = requests.get(news_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            news_list = []
            news_elements = soup.select('div.cluster_group div.cluster_text_headline a')
            
            for i, news in enumerate(news_elements[:10]):  # 상위 10개 뉴스
                title = news.get_text(strip=True)
                link = "https://news.naver.com" + news.get('href', '')
                
                news_list.append({
                    "title": title,
                    "link": link,
                    "timestamp": datetime.now().isoformat()
                })
            
            return news_list
            
        except Exception as e:
            logging.error(f"뉴스 수집 실패: {str(e)}")
            return []
    
    def generate_historical_data(self, stock_code, days=30):
        """과거 데이터 생성 (실제 API가 없는 경우를 위한 시뮬레이션)"""
        try:
            # 현재가 기준으로 과거 데이터 생성
            current_data = self.get_stock_price(stock_code)
            if not current_data:
                return []
            
            current_price = current_data['current_price']
            historical_data = []
            
            for i in range(days, 0, -1):
                date = datetime.now() - timedelta(days=i)
                
                # 가격 변동 시뮬레이션 (실제로는 API에서 가져와야 함)
                variation = random.uniform(-0.05, 0.05)  # ±5% 변동
                price = int(current_price * (1 + variation))
                
                historical_data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "price": price,
                    "volume": random.randint(1000000, 10000000)
                })
            
            return historical_data
            
        except Exception as e:
            logging.error(f"과거 데이터 생성 실패: {str(e)}")
            return []
    
    def crawl_all_data(self):
        """모든 데이터 수집 및 저장"""
        logging.info("🚀 데이터 수집 시작")
        start_time = time.time()
        
        try:
            # 1. 주식 개별 정보 수집
            logging.info("📈 주식 개별 정보 수집 시작...")
            stock_data = []
            for i, stock in enumerate(self.stock_list, 1):
                logging.info(f"[{i}/{len(self.stock_list)}] 종목 정보 수집 중: {stock['name']} ({stock['code']})")
                stock_info = self.get_stock_price(stock['code'])
                if stock_info:
                    stock_info.update(stock)
                    stock_data.append(stock_info)
                    logging.info(f"   ✅ {stock['name']}: {stock_info['current_price']:,}원 ({stock_info['change_percent']:+.2f}%)")
                else:
                    logging.warning(f"   ❌ {stock['name']}: 정보 수집 실패")
                
                # 서버 부하 방지를 위한 딜레이
                time.sleep(random.uniform(1, 3))
            
            # 2. 시장 지수 수집
            logging.info("📊 시장 지수 정보 수집 중...")
            market_indices = self.get_market_indices()
            if market_indices:
                logging.info(f"   ✅ KOSPI: {market_indices['kospi']['value']:,.2f} ({market_indices['kospi']['change']:+.2f})")
                logging.info(f"   ✅ KOSDAQ: {market_indices['kosdaq']['value']:,.2f} ({market_indices['kosdaq']['change']:+.2f})")
            else:
                logging.warning("   ❌ 시장 지수 정보 수집 실패")
            
            # 3. 경제 뉴스 수집
            logging.info("📰 경제 뉴스 수집 중...")
            economic_news = self.get_economic_news()
            logging.info(f"   ✅ 뉴스 {len(economic_news)}건 수집 완료")
            
            # 4. 과거 데이터 생성 (실제로는 API에서 가져와야 함)
            logging.info("📅 과거 데이터 생성 중...")
            historical_data = {}
            for stock in stock_data[:5]:  # 상위 5개 종목만
                logging.info(f"   📊 {stock['name']} 과거 데이터 생성 중...")
                historical_data[stock['code']] = self.generate_historical_data(stock['code'])
            
            # 5. 데이터 통합 및 저장
            logging.info("💾 데이터 저장 중...")
            all_data = {
                "timestamp": datetime.now().isoformat(),
                "stocks": stock_data,
                "market_indices": market_indices,
                "news": economic_news,
                "historical_data": historical_data
            }
            
            # JSON 파일로 저장
            data_file = os.path.join(self.data_dir, f"stock_data_{datetime.now().strftime('%Y%m%d')}.json")
            with open(data_file, 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            logging.info(f"   📁 일일 데이터 저장: {data_file}")
            
            # 최신 데이터 파일도 생성
            latest_file = os.path.join(self.data_dir, "latest_stock_data.json")
            with open(latest_file, 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            logging.info(f"   📁 최신 데이터 저장: {latest_file}")
            
            end_time = time.time()
            logging.info(f"🎉 데이터 수집 완료!")
            logging.info(f"   📊 총 {len(stock_data)}개 종목")
            logging.info(f"   📰 뉴스 {len(economic_news)}건")
            logging.info(f"   ⏱️ 소요시간: {end_time - start_time:.2f}초")
            
            return True
            
        except Exception as e:
            logging.error(f"❌ 데이터 수집 실패: {str(e)}")
            import traceback
            logging.error(f"상세 오류: {traceback.format_exc()}")
            return False
    
    def cleanup_old_data(self, days_to_keep=7):
        """오래된 데이터 파일 정리"""
        try:
            current_time = datetime.now()
            data_files = [f for f in os.listdir(self.data_dir) if f.startswith('stock_data_') and f.endswith('.json')]
            
            for file_name in data_files:
                file_path = os.path.join(self.data_dir, file_name)
                file_time = datetime.fromtimestamp(os.path.getctime(file_path))
                
                if (current_time - file_time).days > days_to_keep:
                    os.remove(file_path)
                    logging.info(f"오래된 데이터 파일 삭제: {file_name}")
            
        except Exception as e:
            logging.error(f"데이터 정리 실패: {str(e)}")

def main():
    """메인 실행 함수"""
    crawler = StockDataCrawler()
    
    try:
        # 데이터 수집 실행
        success = crawler.crawl_all_data()
        
        if success:
            # 오래된 데이터 정리
            crawler.cleanup_old_data()
            logging.info("일일 데이터 수집 작업 완료")
        else:
            logging.error("데이터 수집 실패")
            
    except Exception as e:
        logging.error(f"크롤러 실행 오류: {str(e)}")

if __name__ == "__main__":
    main()
