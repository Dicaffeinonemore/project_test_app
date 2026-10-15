"""실행: python -m streamlit run app.py"""
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).resolve().parent

st.set_page_config(page_title="우리 바다 안심도우미", page_icon="🌊", layout="wide", initial_sidebar_state="collapsed")
st.markdown("""<style>
[data-testid="stHeader"], footer {display:none}
.block-container {padding:0.4rem; max-width:1800px}
iframe {border:0; border-radius:12px}
</style>""", unsafe_allow_html=True)


if not (ROOT / "dist" / "index.html").exists():
    st.title("🌊 우리 바다 안심도우미")
    st.error("배포에 필요한 dist 폴더가 없습니다. 로컬에서 빌드한 뒤 dist 폴더를 GitHub 저장소에 함께 올려 주세요.")
    st.code("npm ci\nnpm run build", language="shell")
    st.stop()

# Streamlit이 같은 주소에서 빌드 파일을 제공하므로 별도 공개 포트가 필요 없습니다.
# 현재 앱은 예시 데이터와 상담 체험만 제공하며 Flask는 로컬 API 개발용입니다.
ocean_app = components.declare_component("ocean_care", path=str(ROOT / "dist"))
ocean_app(key="ocean_care")
