# GitHub Pages 배포 가이드

이 파일은 GitHub Pages에 투자 정보 포털을 배포하는 방법을 설명합니다.

## 🚀 배포 단계

### 1. GitHub 리포지토리 생성
1. GitHub에 로그인
2. 오른쪽 상단의 `+` 버튼 클릭 → **New repository** 선택
3. 리포지토리 이름을 `[사용자명].github.io`로 설정
   - 예: `john-doe.github.io`
4. **Public** 선택 (GitHub Pages는 무료 플랜에서 퍼블릭 리포지토리만 지원)
5. **Add a README file** 체크
6. **Create repository** 클릭

### 2. 파일 업로드
1. 생성된 리포지토리에서 **Add file** → **Upload files** 클릭
2. 이 폴더의 모든 파일을 드래그 앤 드롭으로 업로드
3. **Commit changes** 클릭

### 3. GitHub Pages 설정
1. 리포지토리에서 **Settings** 탭 클릭
2. 왼쪽 사이드바에서 **Pages** 클릭
3. **Source** 섹션에서 **Deploy from a branch** 선택
4. **Branch** 드롭다운에서 **main** 선택
5. **Save** 클릭

### 4. 배포 확인
- 몇 분 후 `https://[사용자명].github.io`에서 사이트 확인
- 변경사항이 반영되려면 최대 10분 소요

## 📝 파일 수정 후 배포

### 자동 배포
- GitHub에 파일을 푸시하면 자동으로 배포됨
- `git push origin main` 명령어 사용

### 수동 배포 (GitHub 웹에서)
1. 파일 편집 후 **Commit changes** 클릭
2. 자동으로 배포 시작

## 🔧 커스터마이징

### 테마 변경
`_config.yml` 파일에서 `theme:` 부분을 수정:
```yaml
theme: jekyll-theme-cayman  # 다른 테마로 변경
```

### 사용 가능한 테마
- `jekyll-theme-minimal` (현재 사용 중)
- `jekyll-theme-cayman`
- `jekyll-theme-dinky`
- `jekyll-theme-leap-day`
- `jekyll-theme-merlot`
- `jekyll-theme-midnight`
- `jekyll-theme-slate`
- `jekyll-theme-tactile`
- `jekyll-theme-time-machine`

### 투자 정보 수정
1. `README.md` - 메인 페이지 내용
2. `_config.yml` - 사이트 설정
3. `about.md` - 투자 가이드
4. `projects.md` - 시장 분석
5. `contact.md` - 포트폴리오 도구

## 🐛 문제 해결

### 사이트가 보이지 않는 경우
1. 리포지토리가 퍼블릭인지 확인
2. GitHub Pages 설정에서 올바른 브랜치 선택했는지 확인
3. 몇 분 더 기다리기

### 테마가 적용되지 않는 경우
1. `_config.yml` 파일이 올바른 형식인지 확인
2. 테마 이름이 정확한지 확인
3. 파일 저장 후 몇 분 기다리기

## 📚 추가 리소스

- [GitHub Pages 공식 문서](https://docs.github.com/ko/pages)
- [Jekyll 테마 가이드](https://pages.github.com/themes/)
- [Markdown 문법 가이드](https://guides.github.com/features/mastering-markdown/)

---

**참고**: 이 가이드는 GitHub Pages 무료 플랜을 기준으로 작성되었습니다.
