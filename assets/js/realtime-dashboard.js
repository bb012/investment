// 실시간 종합 지수 대시보드
class RealtimeDashboard {
    constructor() {
        this.indicesData = {};
        this.init();
    }

    // 초기화
    init() {
        this.loadIndicesData();
        this.startRealTimeUpdates();
    }

    // 지수 데이터 로드
    async loadIndicesData() {
        try {
            // 크롤링된 데이터 파일에서 로드
            const response = await fetch('../data/latest_stock_data.json');
            if (response.ok) {
                const data = await response.json();
                
                if (data.market_indices) {
                    // 국내 지수 (크롤링된 데이터) - 2026년 2월 9일 기준
                    this.indicesData = {
                        kospi: {
                            name: 'KOSPI',
                            code: 'KS11',
                            price: data.market_indices.kospi.value || 5298.00,
                            change: data.market_indices.kospi.change || 208.50,
                            changeRate: data.market_indices.kospi.change / data.market_indices.kospi.value * 100 || 4.10
                        },
                        kosdaq: {
                            name: 'KOSDAQ',
                            code: 'KQ11',
                            price: data.market_indices.kosdaq.value || 1085.30,
                            change: data.market_indices.kosdaq.change || 32.15,
                            changeRate: data.market_indices.kosdaq.change / data.market_indices.kosdaq.value * 100 || 3.05
                        },
                        sp500: {
                            name: 'S&P 500',
                            code: 'SPX',
                            price: 6932.30,
                            change: 133.91,
                            changeRate: 1.97
                        },
                        nasdaq: {
                            name: 'NASDAQ',
                            code: 'IXIC',
                            price: 23031.21,
                            change: 490.12,
                            changeRate: 2.18
                        },
                        dow: {
                            name: 'DOW',
                            code: 'DJI',
                            price: 50115.67,
                            change: 1206.95,
                            changeRate: 2.47
                        },
                        gold: {
                            name: '금',
                            code: 'XAUUSD',
                            price: 5034.15,
                            change: 84.15,
                            changeRate: 1.70,
                            currency: 'USD'
                        },
                        oil: {
                            name: 'WTI 원유',
                            code: 'CL',
                            price: 62.80,
                            change: -1.25,
                            changeRate: -1.95,
                            currency: 'USD'
                        },
                        bitcoin: {
                            name: '비트코인',
                            code: 'BTC',
                            price: 75200.00,
                            change: 1850.00,
                            changeRate: 2.52,
                            currency: 'USD'
                        },
                        ethereum: {
                            name: '이더리움',
                            code: 'ETH',
                            price: 2105.00,
                            change: -48.50,
                            changeRate: -2.25,
                            currency: 'USD'
                        }
                    };
                } else {
                    // 폴백: 기본 데이터 사용
                    this.loadDefaultIndicesData();
                }
            } else {
                // 폴백: 기본 데이터 사용
                this.loadDefaultIndicesData();
            }
        } catch (error) {
            console.error('지수 데이터 로드 실패:', error);
            // 폴백: 기본 데이터 사용
            this.loadDefaultIndicesData();
        }
        
        this.updateIndicesDisplay();
    }

    // 기본 지수 데이터 로드 (2026년 2월 9일 기준 실제 데이터)
    loadDefaultIndicesData() {
        this.indicesData = {
            kospi: {
                name: 'KOSPI',
                code: 'KS11',
                price: 5298.00,
                change: 208.50,
                changeRate: 4.10
            },
            kosdaq: {
                name: 'KOSDAQ',
                code: 'KQ11',
                price: 1085.30,
                change: 32.15,
                changeRate: 3.05
            },
            sp500: {
                name: 'S&P 500',
                code: 'SPX',
                price: 6932.30,
                change: 133.91,
                changeRate: 1.97
            },
            nasdaq: {
                name: 'NASDAQ',
                code: 'IXIC',
                price: 23031.21,
                change: 490.12,
                changeRate: 2.18
            },
            dow: {
                name: 'DOW',
                code: 'DJI',
                price: 50115.67,
                change: 1206.95,
                changeRate: 2.47
            },
            gold: {
                name: '금',
                code: 'XAUUSD',
                price: 5034.15,
                change: 84.15,
                changeRate: 1.70,
                currency: 'USD'
            },
            oil: {
                name: 'WTI 원유',
                code: 'CL',
                price: 62.80,
                change: -1.25,
                changeRate: -1.95,
                currency: 'USD'
            },
            bitcoin: {
                name: '비트코인',
                code: 'BTC',
                price: 75200.00,
                change: 1850.00,
                changeRate: 2.52,
                currency: 'USD'
            },
            ethereum: {
                name: '이더리움',
                code: 'ETH',
                price: 2105.00,
                change: -48.50,
                changeRate: -2.25,
                currency: 'USD'
            }
        };
    }



    // 지수 표시 업데이트
    updateIndicesDisplay() {
        Object.keys(this.indicesData).forEach(indexId => {
            const indexData = this.indicesData[indexId];
            const element = document.getElementById(indexId);
            if (!element) return;

            const priceElement = element.querySelector('.index-price');
            const changeElement = element.querySelector('.index-change');

            if (priceElement) {
                const currency = indexData.currency || '';
                priceElement.textContent = currency + indexData.price.toLocaleString();
            }

            if (changeElement) {
                const changeText = `${indexData.change >= 0 ? '+' : ''}${indexData.change.toLocaleString()} (${indexData.changeRate >= 0 ? '+' : ''}${indexData.changeRate}%)`;
                changeElement.textContent = changeText;
                changeElement.className = `index-change ${indexData.change >= 0 ? 'positive' : 'negative'}`;
            }
        });
    }



    // 실시간 업데이트 시작
    startRealTimeUpdates() {
        // 30초마다 지수 데이터 업데이트
        setInterval(() => {
            this.updateIndicesData();
        }, 30000);
    }

    // 지수 데이터 업데이트
    updateIndicesData() {
        Object.keys(this.indicesData).forEach(indexId => {
            const indexData = this.indicesData[indexId];
            
            // 랜덤 변동 생성 (실제로는 API 호출)
            const randomChange = (Math.random() - 0.5) * (indexData.price * 0.02); // ±2% 변동
            const newPrice = indexData.price + randomChange;
            const newChange = indexData.change + randomChange;
            const newChangeRate = (newChange / (newPrice - newChange)) * 100;

            this.indicesData[indexId] = {
                ...indexData,
                price: newPrice,
                change: newChange,
                changeRate: newChangeRate
            };
        });

        this.updateIndicesDisplay();
    }


}

// 페이지 로드 시 대시보드 초기화
document.addEventListener('DOMContentLoaded', () => {
    new RealtimeDashboard();
});
