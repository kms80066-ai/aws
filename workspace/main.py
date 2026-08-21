from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pymysql
import os

app = FastAPI(title="KMS26 Quiz API Service")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_HOST = os.getenv("DB_HOST", "10.0.156.4")
DB_USER = os.getenv("DB_USER", "std09")
DB_PASS = os.getenv("DB_PASS", "qwe123")
DB_NAME = os.getenv("DB_NAME", "std09db")
DB_PORT = int(os.getenv("DB_PORT", 3306))

def get_db_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        port=DB_PORT,
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=5
    )

class AnswerSubmission(BaseModel):
    quiz_id: int
    selected_option: int

@app.get("/")
def read_root():
    return {"status": "online", "message": "FastAPI Quiz WAS Service"}

@app.get("/quiz")
def get_quiz():
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 데이터가 없을 경우 기본 퀴즈 1개 자동 삽입
            cursor.execute("SELECT COUNT(*) as count FROM tquiz;")
            if cursor.fetchone()['count'] == 0:
                insert_sql = """
                    INSERT INTO tquiz (question, option1, option2, option3, option4, option5, answer)
                    VALUES (
                        'AWS 3-Tier 아키텍처에서 외부 웹 요청을 가장 먼저 받아 프록시 처리를 담당하는 웹 서버는 무엇일까요?',
                        'MySQL', 'FastAPI', 'Nginx', 'S3', 'Lambda', 3
                    );
                """
                cursor.execute(insert_sql)
                conn.commit()

            cursor.execute("SELECT * FROM tquiz LIMIT 1;")
            quiz = cursor.fetchone()

        conn.close()
        
        return {
            "id": quiz['id'],
            "question": quiz['question'],
            "options": [
                quiz['option1'],
                quiz['option2'],
                quiz['option3'],
                quiz['option4'],
                quiz['option5']
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB 통신 오류: {str(e)}")

@app.post("/quiz/submit")
def submit_quiz(submission: AnswerSubmission):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT answer FROM tquiz WHERE id = %s;", (submission.quiz_id,))
            quiz = cursor.fetchone()

        conn.close()

        if not quiz:
            raise HTTPException(status_code=404, detail="퀴즈를 찾을 수 없습니다.")

        correct_answer = quiz['answer']
        is_correct = (submission.selected_option == correct_answer)

        return {
            "is_correct": is_correct,
            "message": "정답입니다! 정답은 3번 Nginx입니다." if is_correct else f"정답은 {correct_answer}번입니다."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"검증 오류: {str(e)}")