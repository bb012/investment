// 실시간 투자 분석 대시보드
class InvestmentDashboard {
    constructor() {
        this.currentStock = null;
        this.newsData = [];
        this.priceData = [];
        this.analysisData = {};
        this.priceChart = null; // 차트 인스턴스 저장
        this.init();
    }

    // 초기화
    init() {
        this.setupEventListeners();
        this.loadDefaultStock();
        this.startRealTimeUpdates();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 종목 검색
        const searchInput = document.getElementById('stock-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleStockSearch(e.target.value));
        }

        // 종목 선택
        const stockList = document.getElementById('stock-list');
        if (stockList) {
            stockList.addEventListener('click', (e) => {
                if (e.target.classList.contains('stock-item')) {
                    this.selectStock(e.target.dataset.code);
                }
            });
        }
    }

    // 종목 검색 처리
    handleStockSearch(query) {
        if (query.length < 2) return;
        
        // 실제 API에서는 종목 검색 API 호출
        this.searchStocks(query);
    }

    // 종목 검색
    async searchStocks(query) {
        try {
            // 예시 데이터 (실제로는 API 호출)
            const stocks = [
                { code: '005930', name: '삼성전자', market: 'KOSPI' },
                { code: '000660', name: 'SK하이닉스', market: 'KOSPI' },
                { code: '035420', name: 'NAVER', market: 'KOSPI' },
                { code: '051910', name: 'LG화학', market: 'KOSPI' }
            ].filter(stock => 
                stock.name.includes(query) || stock.code.includes(query)
            );

            this.displayStockList(stocks);
        } catch (error) {
            console.error('종목 검색 오류:', error);
        }
    }

    // 종목 목록 표시
    displayStockList(stocks) {
        const stockList = document.getElementById('stock-list');
        if (!stockList) return;

        stockList.innerHTML = stocks.map(stock => `
            <div class="stock-item" data-code="${stock.code}">
                <span class="stock-name">${stock.name}</span>
                <span class="stock-code">${stock.code}</span>
                <span class="stock-market">${stock.market}</span>
            </div>
        `).join('');
    }

    // 종목 선택
    async selectStock(stockCode) {
        this.currentStock = stockCode;
        await this.loadStockData(stockCode);
        this.updateDashboard();
    }

    // 종목 데이터 로드
    async loadStockData(stockCode) {
        try {
            // 실제 API에서는 종목 정보, 가격 데이터, 뉴스 등 호출
            await Promise.all([
                this.loadStockInfo(stockCode),
                this.loadPriceData(stockCode),
                this.loadNewsData(stockCode),
                this.loadAnalysisData(stockCode)
            ]);
        } catch (error) {
            console.error('종목 데이터 로드 오류:', error);
        }
    }

    // 종목 기본 정보 로드
    async loadStockInfo(stockCode) {
        // 예시 데이터
        this.stockInfo = {
            code: stockCode,
            name: '삼성전자',
            currentPrice: 75000,
            change: 1500,
            changeRate: 2.04,
            volume: 15000000,
            marketCap: 45000000000000
        };
    }

    // 가격 데이터 로드
    async loadPriceData(stockCode) {
        // 예시 데이터 (실제로는 차트 API 호출)
        this.priceData = this.generateSamplePriceData();
    }

    // 뉴스 데이터 로드
    async loadNewsData(stockCode) {
        // 예시 데이터 (실제로는 뉴스 크롤링 API 호출)
        this.newsData = [
            {
                title: '삼성전자, 2분기 실적 전망 긍정적',
                source: '한국경제',
                time: '2시간 전',
                sentiment: 'positive',
                impact: 'high'
            },
            {
                title: '반도체 시장 회복세, 삼성전자 수혜',
                source: '매일경제',
                time: '4시간 전',
                sentiment: 'positive',
                impact: 'medium'
            },
            {
                title: '삼성전자 신제품 출시 예정',
                source: '이데일리',
                time: '6시간 전',
                sentiment: 'neutral',
                impact: 'low'
            }
        ];
    }

    // 분석 데이터 로드
    async loadAnalysisData(stockCode) {
        // 예시 데이터 (실제로는 분석 API 호출)
        this.analysisData = {
            per: 12.5,
            pbr: 1.2,
            roe: 18.5,
            technicalScore: 75,
            fundamentalScore: 80,
            newsScore: 70,
            totalScore: 75,
            recommendation: 'buy' // buy, hold, sell
        };
    }

    // 샘플 가격 데이터 생성
    generateSamplePriceData() {
        const data = [];
        const basePrice = 75000;
        const now = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            const randomChange = (Math.random() - 0.5) * 2000;
            const price = basePrice + randomChange;
            
            data.push({
                date: date.toISOString().split('T')[0],
                price: Math.round(price),
                volume: Math.floor(Math.random() * 20000000) + 10000000
            });
        }
        
        return data;
    }

    // 대시보드 업데이트
    updateDashboard() {
        this.updateStockInfo();
        this.updatePriceChart();
        this.updateNewsList();
        this.updateAnalysis();
        this.updateBuySignal();
    }

    // 종목 정보 업데이트
    updateStockInfo() {
        const stockInfoElement = document.getElementById('stock-info');
        if (!stockInfoElement || !this.stockInfo) return;

        stockInfoElement.innerHTML = `
            <div class="stock-header">
                <h2>${this.stockInfo.name} (${this.stockInfo.code})</h2>
                <div class="price-info">
                    <span class="current-price">${this.stockInfo.currentPrice.toLocaleString()}원</span>
                    <span class="price-change ${this.stockInfo.change >= 0 ? 'positive' : 'negative'}">
                        ${this.stockInfo.change >= 0 ? '+' : ''}${this.stockInfo.change.toLocaleString()}원
                        (${this.stockInfo.changeRate}%)
                    </span>
                </div>
            </div>
            <div class="stock-details">
                <div class="detail-item">
                    <span class="label">거래량:</span>
                    <span class="value">${this.stockInfo.volume.toLocaleString()}</span>
                </div>
                <div class="detail-item">
                    <span class="label">시가총액:</span>
                    <span class="value">${(this.stockInfo.marketCap / 1000000000000).toFixed(1)}조원</span>
                </div>
            </div>
        `;
    }

    // 가격 차트 업데이트
    updatePriceChart() {
        const chartElement = document.getElementById('price-chart');
        if (!chartElement || !this.priceData.length) return;

        // Chart.js를 사용한 차트 생성 (실제 구현에서는 Chart.js 라이브러리 필요)
        this.createPriceChart(chartElement);
    }

    // 차트 생성
    createPriceChart(container) {
        // 기존 차트가 있다면 제거
        if (this.priceChart) {
            this.priceChart.destroy();
        }

        // 차트 컨테이너 초기화
        container.innerHTML = '<canvas id="price-chart-canvas"></canvas>';
        
        const ctx = container.querySelector('#price-chart-canvas').getContext('2d');
        
        // 차트 데이터 준비
        const labels = this.priceData.map(item => item.date);
        const prices = this.priceData.map(item => item.price);
        
        // 차트 생성
        this.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '주가',
                    data: prices,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '주가 차트 (30일)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return '주가: ' + context.parsed.y.toLocaleString() + '원';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '날짜'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '주가 (원)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + '원';
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#5a6fd8'
                    }
                }
            }
        });
    }

    // 뉴스 목록 업데이트
    updateNewsList() {
        const newsElement = document.getElementById('news-list');
        if (!newsElement || !this.newsData.length) return;

        newsElement.innerHTML = `
            <h3>최신 뉴스</h3>
            <div class="news-items">
                ${this.newsData.map(news => `
                    <div class="news-item ${news.sentiment}">
                        <div class="news-header">
                            <span class="news-title">${news.title}</span>
                            <span class="news-source">${news.source}</span>
                            <span class="news-time">${news.time}</span>
                        </div>
                        <div class="news-impact">
                            <span class="impact-label">영향도:</span>
                            <span class="impact-value ${news.impact}">${news.impact}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 분석 정보 업데이트
    updateAnalysis() {
        const analysisElement = document.getElementById('analysis-info');
        if (!analysisElement || !this.analysisData) return;

        analysisElement.innerHTML = `
            <h3>투자 분석</h3>
            <div class="analysis-grid">
                <div class="analysis-item">
                    <span class="label">PER:</span>
                    <span class="value">${this.analysisData.per}</span>
                </div>
                <div class="analysis-item">
                    <span class="label">PBR:</span>
                    <span class="value">${this.analysisData.pbr}</span>
                </div>
                <div class="analysis-item">
                    <span class="label">ROE:</span>
                    <span class="value">${this.analysisData.roe}%</span>
                </div>
                <div class="analysis-item">
                    <span class="label">기본적 분석:</span>
                    <span class="value">${this.analysisData.fundamentalScore}점</span>
                </div>
                <div class="analysis-item">
                    <span class="label">기술적 분석:</span>
                    <span class="value">${this.analysisData.technicalScore}점</span>
                </div>
                <div class="analysis-item">
                    <span class="label">뉴스 분석:</span>
                    <span class="value">${this.analysisData.newsScore}점</span>
                </div>
            </div>
        `;
    }

    // 매수 신호 업데이트
    updateBuySignal() {
        const signalElement = document.getElementById('buy-signal');
        if (!signalElement || !this.analysisData) return;

        const score = this.analysisData.totalScore;
        let signalClass = '';
        let signalText = '';
        let signalColor = '';

        if (score >= 80) {
            signalClass = 'strong-buy';
            signalText = '강력한 매수';
            signalColor = '🟢';
        } else if (score >= 60) {
            signalClass = 'buy';
            signalText = '매수 고려';
            signalColor = '🟡';
        } else if (score >= 40) {
            signalClass = 'hold';
            signalText = '중립/관망';
            signalColor = '⚪';
        } else if (score >= 20) {
            signalClass = 'caution';
            signalText = '매수 신중';
            signalColor = '🟠';
        } else {
            signalClass = 'sell';
            signalText = '매수 금지';
            signalColor = '🔴';
        }

        signalElement.innerHTML = `
            <div class="buy-signal ${signalClass}">
                <h3>매수 타이밍 신호</h3>
                <div class="signal-display">
                    <span class="signal-icon">${signalColor}</span>
                    <span class="signal-text">${signalText}</span>
                    <span class="signal-score">${score}점</span>
                </div>
                <div class="signal-breakdown">
                    <div class="breakdown-item">
                        <span class="label">기본적 분석:</span>
                        <span class="value">${this.analysisData.fundamentalScore}점</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="label">기술적 분석:</span>
                        <span class="value">${this.analysisData.technicalScore}점</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="label">뉴스 분석:</span>
                        <span class="value">${this.analysisData.newsScore}점</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 기본 종목 로드
    loadDefaultStock() {
        this.selectStock('005930'); // 삼성전자
    }

    // 실시간 업데이트 시작
    startRealTimeUpdates() {
        // 1분마다 가격 데이터 업데이트
        setInterval(() => {
            if (this.currentStock) {
                this.updatePriceData();
            }
        }, 60000);

        // 5분마다 뉴스 데이터 업데이트
        setInterval(() => {
            if (this.currentStock) {
                this.updateNewsData();
            }
        }, 300000);
    }

    // 가격 데이터 업데이트
    updatePriceData() {
        // 실제 구현에서는 실시간 가격 API 호출
        if (this.stockInfo) {
            const randomChange = (Math.random() - 0.5) * 1000;
            this.stockInfo.currentPrice += randomChange;
            this.stockInfo.change += randomChange;
            this.stockInfo.changeRate = (this.stockInfo.change / (this.stockInfo.currentPrice - this.stockInfo.change)) * 100;
            
            // 새로운 가격 데이터 추가
            const now = new Date();
            const newDataPoint = {
                date: now.toISOString().split('T')[0],
                price: this.stockInfo.currentPrice,
                volume: Math.floor(Math.random() * 20000000) + 10000000
            };
            
            // 최신 30개 데이터만 유지
            this.priceData.push(newDataPoint);
            if (this.priceData.length > 30) {
                this.priceData.shift();
            }
            
            this.updateStockInfo();
            this.updatePriceChart(); // 차트 업데이트
        }
    }

    // 뉴스 데이터 업데이트
    updateNewsData() {
        // 실제 구현에서는 뉴스 크롤링 API 호출
        console.log('뉴스 데이터 업데이트 중...');
    }
}

// 페이지 로드 시 대시보드 초기화
document.addEventListener('DOMContentLoaded', () => {
    new InvestmentDashboard();
});
