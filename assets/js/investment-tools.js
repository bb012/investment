// 투자 도구 및 계산기 페이지
class InvestmentTools {
    constructor() {
        this.init();
    }

    // 초기화
    init() {
        this.setupEventListeners();
        this.initializeCalculators();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 입력 필드에서 Enter 키 이벤트
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const calculator = input.closest('.calculator-category');
                    const button = calculator.querySelector('.calculate-button');
                    if (button) {
                        button.click();
                    }
                }
            });
        });

        // 입력 필드 자동 계산 (값 변경 시)
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    }

    // 계산기 초기화
    initializeCalculators() {
        // 기본값 설정
        this.setDefaultValues();
        
        // 결과 표시 초기화
        this.clearAllResults();
    }

    // 기본값 설정
    setDefaultValues() {
        // 복리 계산기 기본값
        document.getElementById('compound-principal').value = '1000000';
        document.getElementById('compound-rate').value = '7';
        document.getElementById('compound-years').value = '10';

        // 단리 계산기 기본값
        document.getElementById('simple-principal').value = '1000000';
        document.getElementById('simple-rate').value = '5';
        document.getElementById('simple-years').value = '5';

        // 목표 금액 계산기 기본값
        document.getElementById('target-amount').value = '10000000';
        document.getElementById('target-rate').value = '8';
        document.getElementById('target-years').value = '20';
    }

    // 입력값 검증
    validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = input.max ? parseFloat(input.max) : null;

        if (isNaN(value) || value < min) {
            input.style.borderColor = '#ff6b6b';
            return false;
        }

        if (max && value > max) {
            input.style.borderColor = '#ff6b6b';
            return false;
        }

        input.style.borderColor = '#ddd';
        return true;
    }

    // 모든 결과 초기화
    clearAllResults() {
        const resultElements = document.querySelectorAll('.result-value');
        resultElements.forEach(element => {
            element.textContent = '-';
        });
    }

    // 숫자 포맷팅 (천 단위 구분자)
    formatNumber(number) {
        return new Intl.NumberFormat('ko-KR').format(Math.round(number));
    }

    // 퍼센트 포맷팅
    formatPercentage(number) {
        return number.toFixed(2) + '%';
    }
}

// 1. 복리 계산기
function calculateCompound() {
    const principal = parseFloat(document.getElementById('compound-principal').value);
    const rate = parseFloat(document.getElementById('compound-rate').value);
    const years = parseFloat(document.getElementById('compound-years').value);

    // 입력값 검증
    if (isNaN(principal) || isNaN(rate) || isNaN(years) || principal < 0 || rate < 0 || years < 1) {
        alert('올바른 값을 입력해주세요.');
        return;
    }

    // 복리 계산
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    const finalAmount = principal * Math.pow(1 + monthlyRate, months);
    const totalProfit = finalAmount - principal;

    // 결과 표시
    document.getElementById('compound-final').textContent = formatNumber(finalAmount) + '원';
    document.getElementById('compound-profit').textContent = formatNumber(totalProfit) + '원';

    // 결과 애니메이션
    animateResult('compound-result');
}

// 2. 단리 계산기
function calculateSimple() {
    const principal = parseFloat(document.getElementById('simple-principal').value);
    const rate = parseFloat(document.getElementById('simple-rate').value);
    const years = parseFloat(document.getElementById('simple-years').value);

    // 입력값 검증
    if (isNaN(principal) || isNaN(rate) || isNaN(years) || principal < 0 || rate < 0 || years < 1) {
        alert('올바른 값을 입력해주세요.');
        return;
    }

    // 단리 계산
    const annualInterest = principal * (rate / 100);
    const totalInterest = annualInterest * years;
    const finalAmount = principal + totalInterest;

    // 결과 표시
    document.getElementById('simple-final').textContent = formatNumber(finalAmount) + '원';
    document.getElementById('simple-profit').textContent = formatNumber(totalInterest) + '원';

    // 결과 애니메이션
    animateResult('simple-result');
}

// 3. 목표 금액 계산기
function calculateTarget() {
    const targetAmount = parseFloat(document.getElementById('target-amount').value);
    const rate = parseFloat(document.getElementById('target-rate').value);
    const years = parseFloat(document.getElementById('target-years').value);

    // 입력값 검증
    if (isNaN(targetAmount) || isNaN(rate) || isNaN(years) || targetAmount < 0 || rate < 0 || years < 1) {
        alert('올바른 값을 입력해주세요.');
        return;
    }

    // 목표 금액 계산
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    
    // 필요한 초기 투자금 계산 (복리 공식 역산)
    const requiredPrincipal = targetAmount / Math.pow(1 + monthlyRate, months);
    
    // 월 정기투자 계산 (정기투자 공식)
    const monthlyInvestment = (targetAmount - requiredPrincipal) / 
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    // 결과 표시
    document.getElementById('target-principal').textContent = formatNumber(requiredPrincipal) + '원';
    document.getElementById('target-monthly').textContent = formatNumber(monthlyInvestment) + '원';

    // 결과 애니메이션
    animateResult('target-result');
}

// 결과 애니메이션
function animateResult(resultId) {
    const resultElement = document.getElementById(resultId);
    resultElement.style.transform = 'scale(1.05)';
    resultElement.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
        resultElement.style.transform = 'scale(1)';
    }, 300);
}

// 숫자 포맷팅 함수들
function formatNumber(number) {
    return new Intl.NumberFormat('ko-KR').format(Math.round(number));
}

function formatPercentage(number) {
    return number.toFixed(2) + '%';
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new InvestmentTools();
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    // Ctrl + 1: 복리 계산기로 이동
    if (e.ctrlKey && e.key === '1') {
        document.querySelector('.basic-calculators-section').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Ctrl + 2: 주식 계산기로 이동
    if (e.ctrlKey && e.key === '2') {
        document.querySelector('.stock-calculators-section').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Ctrl + 3: 포트폴리오 도구로 이동
    if (e.ctrlKey && e.key === '3') {
        document.querySelector('.portfolio-tools-section').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Ctrl + 4: 사용 팁으로 이동
    if (e.ctrlKey && e.key === '4') {
        document.querySelector('.tips-section').scrollIntoView({ behavior: 'smooth' });
    }
});

// 스크롤 애니메이션
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.dashboard-header');
    
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// 계산기 카테고리 호버 효과
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.calculator-category').forEach(category => {
        category.addEventListener('mouseenter', () => {
            category.style.transform = 'translateY(-5px)';
            category.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
        });
        
        category.addEventListener('mouseleave', () => {
            category.style.transform = 'translateY(0)';
            category.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });
    });
});
