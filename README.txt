우리 바다 안심도우미 — 구동 확인용 프로토타입

실행 방법 (Windows)
1. start.bat을 실행합니다.
2. 브라우저에서 http://localhost:8501 에 접속합니다.
   Streamlit 화면이 열리면 내장 Flask 서버도 시작됩니다.
3. React 화면만 보려면 http://localhost:5000 에 접속합니다.
4. 종료하려면 실행한 터미널에서 Ctrl+C를 누릅니다.

현재 프로젝트에는 의존성 설치와 React 빌드가 완료되어 있습니다.
바로 실행: .\.venv\Scripts\python.exe -m streamlit run app.py

다른 PC에서 수동 설치
Python 3.11 이상, Node.js 20.19 이상이 필요합니다.
  python -m venv .venv
  .\.venv\Scripts\python.exe -m pip install -r requirements.txt
  npm.cmd install
  npm.cmd run build
  .\.venv\Scripts\python.exe -m streamlit run app.py

모바일 테스트
PC와 휴대폰을 같은 Wi-Fi에 연결합니다.
먼저 PC에서 http://localhost:8501 에 접속하여 Flask 서버를 시작합니다.
휴대폰에서 http://PC의IPv4주소:5000 에 접속합니다.
PC의 주소는 PowerShell에서 ipconfig 명령으로 확인할 수 있습니다.
Windows 방화벽에서 Python의 개인 네트워크 접근이 허용되어야 합니다.
Streamlit 화면도 http://PC의IPv4주소:8501 에서 볼 수 있습니다.
로컬 HTTP 테스트용이며 HTTPS 배포 설정은 포함하지 않습니다.

사용 기술
- Python: 예시 데이터 처리와 위험 단계 계산
- Flask (server.py): 데이터 API, 상담 체험 API, React 정적 파일 제공
- React (src/main.jsx): 반응형 화면, 그래프, 등록 및 단계 전환
- Streamlit (app.py): Flask 서버를 시작하고 React 화면을 표시하는 실행 화면

화면과 기능
- 첨부 이미지의 6단계 화면, 수온/보험 시뮬레이션, 기능 요약 재현
- 데스크톱 6개 화면, 태블릿 3열, 모바일 1개 화면 및 단계 이동
- 양식장 지역/품종/방식/보험 상태 등록 (브라우저 LocalStorage)
- 지역을 등록하거나 수온 슬라이더를 움직이면 위험 단계 변경
- 점검 체크리스트, 기간별 예시 그래프, 보험 비교 탭
- 상담 신청과 알림 설정은 화면 체험만 제공
- Flask가 없어도 React는 로컬 예시 데이터로 표시

API 키
.env의 다음 값은 모두 비어 있습니다.
OPENAI_API_KEY / PUBLIC_DATA_API_KEY / KMA_API_KEY / NIFS_API_KEY
실제 키를 입력하지 않아도 실행됩니다.
.env는 .gitignore로 제외했고, .env.example에는 빈 양식만 있습니다.
현재 외부 API 호출 코드는 연결하지 않았으므로 키 입력만으로 실시간 데이터가 되지는 않습니다.
DEMO_MODE는 예시 모드 표기이며 현재 버전은 항상 예시 데이터만 사용합니다.
키는 프런트엔드에 넣지 않고 향후 Python 서버에서만 사용해야 합니다.

데이터 안내
demo_data.json에는 첨부 화면의 날짜인 2025-08-20 기준 가상 데이터가 있습니다.
27°C 이상 주의, 29°C 이상 경계는 기능 확인을 위한 임의 기준입니다.
어종별 실제 위험 기준, 공식 특보, 가입 자격, 보험금 산정은 구현되지 않았습니다.
보험 A/B와 금액은 가상 예시입니다. 실제 상담 접수·알림 발송은 하지 않습니다.
수온 그래프의 과거 평균과 예측 탭도 시각화용 시나리오입니다.
등록 정보만 브라우저에 저장되며 체크리스트와 알림 설정은 새로고침 시 초기화됩니다.
public/reference.png는 사용자가 제공한 이미지입니다.
첫 화면의 바다 부분만 SVG 뷰포트로 표시합니다.
Google Fonts를 사용할 수 없으면 PC의 기본 한글 글꼴을 사용합니다.

개발 및 검증
React 화면 수정 후 npm.cmd run build를 실행하고 새로고침합니다.
개발 서버를 쓰려면 터미널 2개에서 각각 다음을 실행합니다.
  .\.venv\Scripts\python.exe server.py
  npm.cmd run dev
개발 서버 주소: http://localhost:5173
Flask 기본 포트는 5000입니다. .env의 FLASK_PORT를 바꾸면
개발 시 vite.config.js의 proxy 포트와 playwright.config.js도 맞춰 주세요.

API 테스트:
  .\.venv\Scripts\python.exe -m unittest discover -s tests -p test_api.py -v
브라우저 테스트 (Flask 서버 실행 및 Edge 설치 필요):
  npx.cmd playwright test
Streamlit 실행 화면 테스트 (Streamlit 서버도 실행 필요):
  node scripts/check-streamlit.mjs
브라우저 검증 스크린샷: test-results 폴더

주요 파일
app.py                 Streamlit 실행 진입점
server.py              Flask API 및 정적 파일 서버
src/main.jsx           React UI와 예시 상호작용
src/style.css          이미지 기반 디자인과 반응형 레이아웃
demo_data.json         공통 예시 데이터
.env / .env.example    빈 API 키 설정
requirements.txt       Python 의존성
package.json           React 및 빌드/테스트 의존성
start.bat              Windows 실행 도우미
