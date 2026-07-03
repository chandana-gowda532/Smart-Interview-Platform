from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine
from pydantic import BaseModel

import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

print("API KEY LOADED:", GEMINI_API_KEY is not None)

client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI()

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


class EvaluationRequest(BaseModel):
    question: str
    answer: str


@app.get("/")
def home():
    return {
        "message": "AI Smart Interview Platform Backend Running"
    }


@app.get("/questions")
def get_all_questions():

    with engine.connect() as conn:

        result = conn.execute(
            text("SELECT * FROM questions")
        )

        questions = []

        for row in result:
            questions.append({
                "id": row[0],
                "topic": row[1],
                "question": row[2],
                "keywords": row[3]
            })

        return questions


@app.get("/questions/{topic}/{count}")
def get_questions(topic: str, count: int):

    with engine.connect() as conn:

        result = conn.execute(
            text("""
                SELECT *
                FROM questions
                WHERE LOWER(topic)=LOWER(:topic)
                ORDER BY RANDOM()
                LIMIT :count
            """),
            {
                "topic": topic,
                "count": count
            }
        )

        questions = []

        for row in result:
            questions.append({
                "id": row[0],
                "topic": row[1],
                "question": row[2],
                "keywords": row[3]
            })

        return questions


@app.post("/evaluate-answer")
def evaluate_answer(data: EvaluationRequest):

    try:

        prompt = f"""
You are a technical interviewer.

Question:
{data.question}

Candidate Answer:
{data.answer}

Evaluate the answer.

Return ONLY JSON in this format:

{{
  "score": 8,
  "feedback": "Good answer. Mention more technical details."
}}

Score must be between 0 and 10.
"""

        print("Sending request to Gemini...")

        response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt
)

        text_response = response.text.strip()

        print("Gemini Response:", text_response)

        text_response = (
            text_response
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        try:
            return json.loads(text_response)

        except Exception:
            return {
                "score": 5,
                "feedback": text_response
            }

    except Exception as e:

        print("Gemini Error:", str(e))

        return {
            "score": 0,
            "feedback": f"Gemini Error: {str(e)}"
        }


@app.post("/save-result")
def save_result(result: Result):

    with engine.connect() as conn:

        user_exists = conn.execute(
            text("""
                SELECT id
                FROM users
                WHERE username=:username
            """),
            {
                "username": result.username
            }
        ).fetchone()

        if not user_exists:

            conn.execute(
                text("""
                    INSERT INTO users(username)
                    VALUES(:username)
                """),
                {
                    "username": result.username
                }
            )

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