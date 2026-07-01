from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine
from pydantic import BaseModel

app = FastAPI()

# Enable React ↔ FastAPI connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Result(BaseModel):
    username: str
    topic: str
    score: int


@app.get("/")
def home():
    return {
        "message": "AI Smart Interview Platform Backend Running"
    }


@app.get("/questions")
def get_questions():
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM questions")
        )

        questions = []

        for row in result:
            questions.append({
                "id": row[0],
                "topic": row[1],
                "question": row[2]
            })

        return questions


@app.get("/questions/{topic}")
def get_question_by_topic(topic: str):
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT *
                FROM questions
                WHERE LOWER(topic)=LOWER(:topic)
                ORDER BY RANDOM()
                LIMIT 1
            """),
            {"topic": topic}
        )

        row = result.fetchone()

        if row:
            return {
                "id": row[0],
                "topic": row[1],
                "question": row[2]
            }

        return {
            "message": "No questions found"
        }


@app.post("/save-result")
def save_result(result: Result):
    with engine.connect() as conn:
        conn.execute(
            text("""
                INSERT INTO interview_results
                (username, topic, score)
                VALUES
                (:username, :topic, :score)
            """),
            {
                "username": result.username,
                "topic": result.topic,
                "score": result.score
            }
        )

        conn.commit()

    return {
        "message": "Result Saved Successfully"
    }


@app.get("/results")
def get_results():
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT *
                FROM interview_results
                ORDER BY interview_date DESC
            """)
        )

        results = []

        for row in result:
            results.append({
                "id": row[0],
                "username": row[1],
                "topic": row[2],
                "score": row[3],
                "interview_date": str(row[4])
            })

        return results