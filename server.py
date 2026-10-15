"""React 정적 파일 및 테스트용 API. 외부 API 호출이나 실제 상담 접수는 없습니다."""
import json
import math
import os
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
DATA = json.loads((ROOT / "demo_data.json").read_text(encoding="utf-8"))


def risk_for(temperature):
    if temperature >= 29:
        return {"level": "경계", "tone": "danger"}
    if temperature >= 27:
        return {"level": "주의", "tone": "warning"}
    return {"level": "관심", "tone": "normal"}


def create_app():
    app = Flask(__name__, static_folder=None)
    app.json.ensure_ascii = False
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024

    @app.get("/api/health")
    def health():
        return jsonify(status="ok", demo=True)

    @app.get("/api/dashboard")
    def dashboard():
        region = request.args.get("region", "통영시")
        species = request.args.get("species", DATA["species"][0])
        if region not in DATA["regions"] or species not in DATA["species"]:
            return jsonify(error="지역 또는 품종을 확인해 주세요."), 400
        try:
            temperature = float(request.args.get("temperature", DATA["temperatures"][region]))
        except (TypeError, ValueError):
            return jsonify(error="수온은 숫자로 입력해 주세요."), 400
        if not math.isfinite(temperature) or not 0 <= temperature <= 40:
            return jsonify(error="수온은 0~40°C 범위로 입력해 주세요."), 400
        return jsonify(**DATA, region=region, selected_species=species, temperature=temperature,
                       risk=risk_for(temperature), demo=True)

    @app.post("/api/consultations")
    def consultations():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return jsonify(error="신청 정보를 확인해 주세요."), 400
        if payload.get("region") not in DATA["regions"] or payload.get("species") not in DATA["species"]:
            return jsonify(error="양식장 정보를 먼저 등록해 주세요."), 400
        return jsonify(status="demo_received", demo=True,
                       message="상담 신청 테스트가 완료되었습니다. 실제 기관에 전송되지 않습니다."), 201

    @app.get("/")
    def index():
        if not (ROOT / "dist" / "index.html").exists():
            return "먼저 npm.cmd install 및 npm.cmd run build를 실행해 주세요.", 503
        return send_from_directory(ROOT / "dist", "index.html")

    @app.get("/<path:filename>")
    def assets(filename):
        return send_from_directory(ROOT / "dist", filename)

    return app


app = create_app()
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("FLASK_PORT", "5000")), debug=False)
