// Chart.js Annotation 플러그인 등록
if (typeof Chart !== 'undefined' && Chart.register) {
    Chart.register(ChartAnnotation);
}

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
            // 크롤링된 데이터 파일에서 로드
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

    // 크롤링된 데이터 파일에서 종목 정보 로드
    async loadStockInfo(stockCode) {
        try {
            const response = await fetch('../data/latest_stock_data.json');
            if (!response.ok) throw new Error('데이터 파일을 불러올 수 없습니다.');
            
            const data = await response.json();
            const stock = data.stocks.find(s => s.code === stockCode);
            
            if (stock) {
                this.currentStockData = stock;
                this.updateStockInfo();
            }
        } catch (error) {
            console.error('종목 정보 로드 실패:', error);
            // 폴백: 기본 데이터 사용
            this.loadDefaultStockInfo(stockCode);
        }
    }

    // 크롤링된 데이터 파일에서 가격 데이터 로드
    async loadPriceData(stockCode) {
        try {
            const response = await fetch('../data/latest_stock_data.json');
            if (!response.ok) throw new Error('데이터 파일을 불러올 수 없습니다.');
            
            const data = await response.json();
            const historicalData = data.historical_data[stockCode];
            
            if (historicalData && historicalData.length > 0) {
                this.priceData = historicalData;
                this.updatePriceChart();
            } else {
                // 폴백: 기본 데이터 사용
                this.loadDefaultPriceData(stockCode);
            }
        } catch (error) {
            console.error('가격 데이터 로드 실패:', error);
            // 폴백: 기본 데이터 사용
            this.loadDefaultPriceData(stockCode);
        }
    }

    // 크롤링된 데이터 파일에서 뉴스 데이터 로드
    async loadNewsData(stockCode) {
        try {
            const response = await fetch('../data/latest_stock_data.json');
            if (!response.ok) throw new Error('데이터 파일을 불러올 수 없습니다.');
            
            const data = await response.json();
            
            if (data.news && data.news.length > 0) {
                this.newsData = data.news;
                this.updateNewsList();
            } else {
                // 폴백: 기본 데이터 사용
                this.loadDefaultNewsData();
            }
        } catch (error) {
            console.error('뉴스 데이터 로드 실패:', error);
            // 폴백: 기본 데이터 사용
            this.loadDefaultNewsData();
        }
    }

    // 크롤링된 데이터 파일에서 분석 데이터 로드
    async loadAnalysisData(stockCode) {
        try {
            const response = await fetch('../data/latest_stock_data.json');
            if (! response.ok) throw new Error('데이터 파일을 불러올 수 없습니다.');
            
            const data = await response.json();
            const stock = data.stocks.find(s => s.code === stockCode);
            
            if (stock) {
                // 기본적 분석 점수 계산
                this.analysisData = {
                    per: this.calculatePER(stock),
                    pbr: this.calculatePBR(stock),
                    roe: this.calculateROE(stock),
                    fundamentalScore: this.calculateFundamentalScore(stock),
                    technicalScore: this.calculateTechnicalScore(stock),
                    newsScore: this.calculateNewsScore()
                };
                this.updateAnalysis();
            } else {
                // 폴백: 기본 데이터 사용
                this.loadDefaultAnalysisData();
            }
        } catch (error) {
            console.error('분석 데이터 로드 실패:', error);
            // 폴백: 기본 데이터 사용
            this.loadDefaultAnalysisData();
        }
    }

    // 종목 기본 정보 로드 (폴백)
    async loadDefaultStockInfo(stockCode) {
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

    // 가격 데이터 로드 (폴백)
    async loadDefaultPriceData(stockCode) {
        // 예시 데이터 (실제로는 차트 API 호출)
        this.priceData = this.generateSamplePriceData();
    }

    // 뉴스 데이터 로드 (폴백)
    async loadDefaultNewsData() {
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

    // 분석 데이터 로드 (폴백)
    async loadDefaultAnalysisData() {
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

    // PER 계산
    calculatePER(stock) {
        // 예시 계산 (실제로는 재무제표 데이터 필요)
        return (stock.current_price / 5000).toFixed(1);
    }

    // PBR 계산
    calculatePBR(stock) {
        // 예시 계산 (실제로는 재무제표 데이터 필요)
        return (stock.current_price / 60000).toFixed(1);
    }

    // ROE 계산
    calculateROE(stock) {
        // 예시 계산 (실제로는 재무제표 데이터 필요)
        return (Math.random() * 20 + 10).toFixed(1);
    }

    // 기본적 분석 점수 계산
    calculateFundamentalScore(stock) {
        // PER, PBR, ROE 등을 종합한 점수
        const per = parseFloat(this.calculatePER(stock));
        const pbr = parseFloat(this.calculatePBR(stock));
        const roe = parseFloat(this.calculateROE(stock));
        
        let score = 50; // 기본 점수
        
        // PER 점수 (낮을수록 좋음)
        if (per < 15) score += 20;
        else if (per < 25) score += 10;
        else score -= 10;
        
        // PBR 점수 (낮을수록 좋음)
        if (pbr < 1.5) score += 15;
        else if (pbr < 3) score += 5;
        else score -= 10;
        
        // ROE 점수 (높을수록 좋음)
        if (roe > 15) score += 15;
        else if (roe > 10) score += 5;
        else score -= 10;
        
        return Math.max(0, Math.min(100, score));
    }

    // 기술적 분석 점수 계산
    calculateTechnicalScore(stock) {
        // 이동평균선, RSI 등을 종합한 점수
        let score = 50; // 기본 점수
        
        // 가격 변동률에 따른 점수
        if (stock.change_percent > 0) score += 20;
        else score -= 20;
        
        // 거래량에 따른 점수
        if (stock.volume > 10000000) score += 15;
        else score -= 15;
        
        return Math.max(0, Math.min(100, score));
    }

    // 뉴스 분석 점수 계산
    calculateNewsScore() {
        // 뉴스 감정 분석 점수
        return Math.floor(Math.random() * 30) + 60; // 60-90점
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
        
        // 차트 데이터 준비 (OHLC 데이터 시뮬레이션)
        const labels = this.priceData.map(item => item.date);
        const prices = this.priceData.map(item => item.price);
        
        // 최소값과 최대값 찾기
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minIndex = prices.indexOf(minPrice);
        const maxIndex = prices.indexOf(maxPrice);
        const currentPrice = prices[prices.length - 1]; // 현재가 (가장 최근 데이터)
        
        // 가격 요약 정보 업데이트
        this.updatePriceSummary(minPrice, maxPrice, currentPrice);
        
        // 이동평균선 계산 (5일, 20일)
        const ma5 = this.calculateMovingAverage(prices, 5);
        const ma20 = this.calculateMovingAverage(prices, 20);
        
        // 볼린저 밴드 계산
        const bbData = this.calculateBollingerBands(prices, 20, 2);
        
        // 차트 생성
        this.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '주가',
                        data: prices,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.1,
                        pointBackgroundColor: '#2563eb',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        yAxisID: 'y'
                    },
                    {
                        label: '5일 이동평균',
                        data: ma5,
                        borderColor: '#f59e0b',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: '20일 이동평균',
                        data: ma20,
                        borderColor: '#dc2626',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: '볼린저 상단',
                        data: bbData.upper,
                        borderColor: 'rgba(156, 163, 175, 0.5)',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        fill: false,
                        pointRadius: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: '볼린저 하단',
                        data: bbData.lower,
                        borderColor: 'rgba(156, 163, 175, 0.5)',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        fill: false,
                        pointRadius: 0,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '주가 차트 & 기술적 지표',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: '#1f2937'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#374151',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                if (context.dataset.label === '주가') {
                                    return '주가: ' + context.parsed.y.toLocaleString() + '원';
                                } else if (context.dataset.label.includes('이동평균')) {
                                    return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + '원';
                                } else if (context.dataset.label.includes('볼린저')) {
                                    return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + '원';
                                }
                                return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + '원';
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            minPrice: {
                                type: 'point',
                                xValue: minIndex,
                                yValue: minPrice,
                                backgroundColor: '#10b981',
                                borderColor: '#10b981',
                                borderWidth: 3,
                                radius: 6,
                                label: {
                                    content: `최저: ${minPrice.toLocaleString()}원`,
                                    position: 'top',
                                    backgroundColor: '#10b981',
                                    color: '#fff',
                                    font: {
                                        size: 11,
                                        weight: 'bold'
                                    },
                                    padding: 6,
                                    borderRadius: 4,
                                    display: true
                                }
                            },
                            maxPrice: {
                                type: 'point',
                                xValue: maxIndex,
                                yValue: maxPrice,
                                backgroundColor: '#ef4444',
                                borderColor: '#ef4444',
                                borderWidth: 3,
                                radius: 6,
                                label: {
                                    content: `최고: ${maxPrice.toLocaleString()}원`,
                                    position: 'bottom',
                                    backgroundColor: '#ef4444',
                                    color: '#fff',
                                    font: {
                                        size: 11,
                                        weight: 'bold'
                                    },
                                    padding: 6,
                                    borderRadius: 4,
                                    display: true
                                }
                            },
                            minLine: {
                                type: 'line',
                                yMin: minPrice,
                                yMax: minPrice,
                                borderColor: '#10b981',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    content: `최저가: ${minPrice.toLocaleString()}원`,
                                    position: 'start',
                                    backgroundColor: '#10b981',
                                    color: '#fff',
                                    font: {
                                        size: 10,
                                        weight: 'bold'
                                    },
                                    padding: 4,
                                    borderRadius: 3,
                                    display: true
                                }
                            },
                            maxLine: {
                                type: 'line',
                                yMin: maxPrice,
                                yMax: maxPrice,
                                borderColor: '#ef4444',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    content: `최고가: ${maxPrice.toLocaleString()}원`,
                                    position: 'end',
                                    backgroundColor: '#ef4444',
                                    color: '#fff',
                                    font: {
                                        size: 10,
                                        weight: 'bold'
                                    },
                                    padding: 4,
                                    borderRadius: 3,
                                    display: true
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '날짜',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: '#374151'
                        },
                        grid: {
                            color: 'rgba(156, 163, 175, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '주가 (원)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: '#374151'
                        },
                        grid: {
                            color: 'rgba(156, 163, 175, 0.3)',
                            drawBorder: false,
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return value.toLocaleString() + '원';
                            },
                            // Y축 간격 조절
                            stepSize: function(context) {
                                const range = context.chart.scales.y.max - context.chart.scales.y.min;
                                if (range > 100000) return 10000;      // 10만원 이상 차이시 1만원 간격
                                else if (range > 50000) return 5000;   // 5만원 이상 차이시 5천원 간격
                                else if (range > 20000) return 2000;   // 2만원 이상 차이시 2천원 간격
                                else if (range > 10000) return 1000;   // 1만원 이상 차이시 1천원 간격
                                else if (range > 5000) return 500;     // 5천원 이상 차이시 500원 간격
                                else return 100;                       // 기본 100원 간격
                            }
                        },
                        // Y축 범위 조절 (상하 여백 추가)
                        beginAtZero: false,
                        suggestedMin: function(context) {
                            const prices = context.chart.data.datasets[0].data.filter(v => v !== null);
                            if (prices.length === 0) return 0;
                            const min = Math.min(...prices);
                            return min * 0.98; // 하단에 2% 여백
                        },
                        suggestedMax: function(context) {
                            const prices = context.chart.data.datasets[0].data.filter(v => v !== null);
                            if (prices.length === 0) return 0;
                            const max = Math.max(...prices);
                            return max * 1.02; // 상단에 2% 여백
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
                        hoverBackgroundColor: '#1d4ed8',
                        hoverBorderColor: '#fff',
                        hoverBorderWidth: 3
                    },
                    line: {
                        tension: 0.1,
                        borderWidth: 3
                    }
                },
                layout: {
                    padding: {
                        top: 30,
                        right: 30,
                        bottom: 30,
                        left: 30
                    }
                }
            }
        });
    }

    // 이동평균 계산
    calculateMovingAverage(data, period) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                result.push(sum / period);
            }
        }
        return result;
    }

    // 볼린저 밴드 계산
    calculateBollingerBands(data, period, multiplier) {
        const upper = [];
        const lower = [];
        
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                upper.push(null);
                lower.push(null);
            } else {
                const slice = data.slice(i - period + 1, i + 1);
                const mean = slice.reduce((a, b) => a + b, 0) / period;
                const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
                const stdDev = Math.sqrt(variance);
                
                upper.push(mean + (multiplier * stdDev));
                lower.push(mean - (multiplier * stdDev));
            }
        }
        
        return { upper, lower };
    }
    
    // 가격 요약 정보 업데이트
    updatePriceSummary(minPrice, maxPrice, currentPrice) {
        const summaryElement = document.getElementById('price-summary');
        if (!summaryElement) return;
        
        // 요약 정보 표시
        summaryElement.style.display = 'flex';
        
        // 최저가 업데이트
        const minPriceElement = summaryElement.querySelector('.min-price');
        if (minPriceElement) {
            minPriceElement.textContent = minPrice.toLocaleString() + '원';
            minPriceElement.className = 'summary-value min-price';
        }
        
        // 최고가 업데이트
        const maxPriceElement = summaryElement.querySelector('.max-price');
        if (maxPriceElement) {
            maxPriceElement.textContent = maxPrice.toLocaleString() + '원';
            maxPriceElement.className = 'summary-value max-price';
        }
        
        // 현재가 업데이트
        const currentPriceElement = summaryElement.querySelector('.current-price');
        if (currentPriceElement) {
            currentPriceElement.textContent = currentPrice.toLocaleString() + '원';
            currentPriceElement.className = 'summary-value current-price';
        }
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
