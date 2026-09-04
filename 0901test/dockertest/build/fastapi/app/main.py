from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import pymysql
import os
import logging

logging.basicConfig(filename='/var/log/fastapi/app.log', level=logging.INFO, format='%(asctime)s - %(message)s')

app = FastAPI()
templates = Jinja2Templates(directory="/app/templates")

DB_HOST = os.environ.get("DB_HOST", "mysql")
DB_USER = os.environ.get("DB_USER", "adm")
DB_PASS = os.environ.get("DB_PASSWORD", "qwe123")
DB_NAME = os.environ.get("DB_NAME", "testdb")

def get_db():
    return pymysql.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASS,
        database=DB_NAME, charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor
    )

@app.get("/items")
@app.get("/loadlist/items")
def get_student_scores():
    try:
        conn = get_db()
        with conn.cursor() as cur:
            sql = """
                SELECT 
                    s.email, 
                    s.email AS id, 
                    s.name, 
                    c.class_name, 
                    c.class_name AS course, 
                    IFNULL(sc.kor, 0) AS kor, 
                    IFNULL(sc.eng, 0) AS eng, 
                    IFNULL(sc.mat, 0) AS mat, 
                    IFNULL(sc.mat, 0) AS math
                FROM tstudent s
                JOIN tclass c ON s.class_idx = c.idx
                LEFT JOIN tscore sc ON s.idx = sc.student_idx
                ORDER BY s.idx ASC;
            """
            cur.execute(sql)
            rows = cur.fetchall()
        conn.close()
        return JSONResponse(content=rows)
    except Exception as e:
        logging.error(f"DB Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test", response_class=HTMLResponse)
async def score_page(request: Request):
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT idx, name, email FROM tstudent ORDER BY idx ASC;")
        students = cur.fetchall()
        cur.execute("""
            SELECT s.name, s.email, c.class_name, sc.kor, sc.eng, sc.mat,
                   ROUND((IFNULL(sc.kor,0) + IFNULL(sc.eng,0) + IFNULL(sc.mat,0)) / 3, 1) as avg
            FROM tstudent s
            JOIN tclass c ON s.class_idx = c.idx
            LEFT JOIN tscore sc ON s.idx = sc.student_idx
            ORDER BY s.idx ASC;
        """)
        scores = cur.fetchall()
    conn.close()
    return templates.TemplateResponse("score.html", {"request": request, "students": students, "scores": scores})

@app.post("/test")
async def register_score(student_idx: int = Form(...), kor: int = Form(...), eng: int = Form(...), mat: int = Form(...)):
    conn = get_db()
    with conn.cursor() as cur:
        sql = """
            INSERT INTO tscore (student_idx, kor, eng, mat)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE kor=%s, eng=%s, mat=%s;
        """
        cur.execute(sql, (student_idx, kor, eng, mat, kor, eng, mat))
        conn.commit()
    conn.close()
    return RedirectResponse(url="/test", status_code=303)