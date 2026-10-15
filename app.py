"""실행: python -m streamlit run app.py"""
import json
import os
import threading
from urllib.request import urlopen

import streamlit as st
import streamlit.components.v1 as components
from server import ROOT, create_app
from werkzeug.serving import make_server

st.set_page_config(page_title="우리 바다 안심도우미", page_icon="🌊", layout="wide", initial_sidebar_state="collapsed")
st.markdown("""<style>
[data-testid="stHeader"], footer {display:none}
.block-container {padding:0.4rem; max-width:1800px}
iframe {border:0; border-radius:12px}
</style>""", unsafe_allow_html=True)


@st.cache_resource
def start_api():
    port = int(os.getenv("FLASK_PORT", "5000"))
    # Windows에서는 같은 포트의 재바인딩이 가능하므로 기존 서버를 먼저 확인합니다.
    try:
        with urlopen(f"http://127.0.0.1:{port}/api/health", timeout=1) as response:
            health = json.load(response)
        if health.get("status") == "ok" and health.get("demo") is True:
            return port
    except Exception:
        pass
    try:
        server = make_server("0.0.0.0", port, create_app(), threaded=True)
    except (OSError, SystemExit) as exc:
        try:
            with urlopen(f"http://127.0.0.1:{port}/api/health", timeout=2) as response:
                health = json.load(response)
            if health.get("status") == "ok" and health.get("demo") is True:
                return port
        except Exception:
            pass
        raise RuntimeError(f"{port} 포트가 사용 중입니다. .env의 FLASK_PORT를 변경해 주세요.") from exc
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return port


if not (ROOT / "dist" / "index.html").exists():
    st.title("🌊 우리 바다 안심도우미")
    st.info("첫 실행 전 터미널에서 React 화면을 빌드해 주세요.")
    st.code("npm.cmd install\nnpm.cmd run build", language="powershell")
    st.stop()

try:
    port = start_api()
except RuntimeError as exc:
    st.error(str(exc))
    st.stop()

# 접속 호스트를 사용하여 같은 Wi-Fi의 모바일에서도 접근할 수 있습니다.
components.html(f"""<!doctype html><html><head><style>
html,body {{margin:0; height:100%; overflow:hidden}} iframe {{width:100%; height:100vh; border:0}}
</style></head><body><iframe id="app" title="우리 바다 안심도우미"></iframe><script>
const host = new URL(document.referrer || window.location.href).hostname;
document.getElementById('app').src = 'http://' + host + ':{port}/';
</script></body></html>""", height=1250, scrolling=False)
