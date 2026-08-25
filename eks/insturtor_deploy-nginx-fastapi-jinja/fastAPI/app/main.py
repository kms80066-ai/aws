from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import pymysql

# app을 선언할 때 root_path 지정
# app = FastAPI(root_path="/board")
app = FastAPI()

# templates 폴더 설정 (index.html이 있는 위치)
templates = Jinja2Templates(directory="templates")

# MySQL 연결 설정 (본인 환경에 맞게 수정하세요)
DB_CONFIG = {
    "host": "my-db",
    "user": "dev",
    "password": "ian1234!",
    "database": "testdb",
    "port": 3306,
    "charset": "utf8mb4"
}

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    # 페이지에 표시될 데이터 정의
    k8s_data = {
        "title": "Kubernetes Navigation",
        "subtitle": "컨테이너 오케스트레이션의 바다를 항해하다",
        "sections": [
            {"id": "arch", "title": "Cluster Architecture", "desc": "Control Plane & Worker Node"},
            {"id": "object", "title": "K8s Objects", "desc": "Pod, Service, Deployment"},
            {"id": "network", "title": "Networking", "desc": "Ingress & Service Mesh"},
            {"id": "storage", "title": "Storage & PV", "desc": "Persistent Volumes"}
        ]
    }
    return templates.TemplateResponse(
        request, "index.html", {"data": k8s_data}
    )

@app.get("/health-check")
def check_db_connection():
    # 데이터베이스 연결 없이 항상 정상 응답 반환
    return {"status": "healthy", "message": "OK"}
