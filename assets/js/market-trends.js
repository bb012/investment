// 시장 동향 및 기술적 분석 페이지
class MarketTrends {
    constructor() {
        this.init();
    }

    // 초기화
    init() {
        this.setupEventListeners();
        this.animateElements();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 분석 카테고리 클릭 이벤트
        document.querySelectorAll('.analysis-category').forEach(category => {
            category.addEventListener('click', () => {
                this.toggleCategory(category);
            });
        });

        // 시그널 카테고리 호버 이벤트
        document.querySelectorAll('.signal-category').forEach(category => {
            category.addEventListener('mouseenter', () => {
                this.highlightSignals(category);
            });
        });

        // 뉴스 아이템 클릭 이벤트
        document.querySelectorAll('.news-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showNewsDetail(item);
            });
        });
    }

    // 카테고리 토글
    toggleCategory(category) {
        const items = category.querySelector('.indicator-items');
        if (items.style.display === 'none') {
            items.style.display = 'block';
            category.classList.add('expanded');
        } else {
            items.style.display = 'none';
            category.classList.remove('expanded');
        }
    }

    // 시그널 하이라이트
    highlightSignals(category) {
        category.style.transform = 'scale(1.02)';
        category.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        
        setTimeout(() => {
            category.style.transform = 'scale(1)';
            category.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        }, 200);
    }

    // 뉴스 상세 보기
    showNewsDetail(item) {
        const title = item.querySelector('h4').textContent;
        const content = item.querySelector('p').textContent;
        
        // 간단한 알림 (실제로는 모달이나 상세 페이지로 이동)
        alert(`${title}\n\n${content}\n\n상세 내용은 추후 구현 예정입니다.`);
    }

    // 요소 애니메이션
    animateElements() {
        // 스크롤 애니메이션
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // 애니메이션 대상 요소들
        document.querySelectorAll('.analysis-category, .monitoring-category, .signal-category, .psychology-category, .news-category').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });
    }

    // 기술적 지표 계산기 (예시)
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses += Math.abs(change);
            }
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        return rsi;
    }

    // 이동평균 계산
    calculateMA(prices, period) {
        if (prices.length < period) return null;
        
        const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
        return sum / period;
    }

    // 볼린저 밴드 계산
    calculateBollingerBands(prices, period = 20, multiplier = 2) {
        if (prices.length < period) return null;
        
        const ma = this.calculateMA(prices, period);
        const variance = prices.slice(-period).reduce((acc, price) => {
            return acc + Math.pow(price - ma, 2);
        }, 0) / period;
        const stdDev = Math.sqrt(variance);
        
        return {
            upper: ma + (multiplier * stdDev),
            middle: ma,
            lower: ma - (multiplier * stdDev)
        };
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new MarketTrends();
});

// 스크롤 이벤트
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.dashboard-header');
    
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    // Ctrl + 1: 기술적 분석으로 이동
    if (e.ctrlKey && e.key === '1') {
        document.querySelector('.technical-analysis-section').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Ctrl + 2: 주요 지수로 이동
    if (e.ctrlKey && e.key === '2') {
        document.querySelector('.indices-monitoring-section').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Ctrl + 3: 매매 시그널로 이동
    if (e.ctrlKey && e.key === '3') {
        document.querySelector('.signal-analysis-section').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Ctrl + 4: 경제 뉴스로 이동
    if (e.ctrlKey && e.key === '4') {
        document.querySelector('.economic-news-section').scrollIntoView({ behavior: 'smooth' });
    }
});
