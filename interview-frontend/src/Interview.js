import React, { useState, useEffect } from "react";
import "./App.css";

function Interview() {
  const [username, setUsername] = useState("");
  const [topic, setTopic] = useState("python");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState("");
  const [aiScore, setAiScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const viewHistory = () => {
    window.open(
      "http://127.0.0.1:8000/results",
      "_blank"
    );
  };

  const startInterview = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/questions/${topic}/10`
      );

      const data = await response.json();

      setQuestions(data);
      setCurrentQuestion(0);
      setScore(0);
      setCompleted(false);
      setAnswer("");
      setFeedback("");
      setAiScore(0);
      setTimeLeft(60);
    } catch (error) {
      console.error(error);
      alert("Unable to load questions");
    }
  };

  const nextQuestion = async () => {
    if (!answer.trim()) {
      alert("Please enter your answer");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/evaluate-answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question:
              questions[currentQuestion].question,
            answer: answer,
          }),
        }
      );

      const aiResult = await response.json();

      setAiScore(aiResult.score);
      setFeedback(aiResult.feedback);

      const questionScore =
        aiResult.score >= 5 ? 1 : 0;

      const newScore = score + questionScore;

      if (currentQuestion < questions.length - 1) {
        setScore(newScore);
        setCurrentQuestion(currentQuestion + 1);
        setAnswer("");
        setTimeLeft(60);
      } else {
        await fetch(
          "http://127.0.0.1:8000/save-result",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              topic,
              score: newScore,
            }),
          }
        );

        setScore(newScore);
        setCompleted(true);
      }
    } catch (error) {
      console.error(error);
      alert("AI evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && !completed) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            nextQuestion();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion, questions.length, completed]);

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 AI Smart Interview Platform</h1>
        <p>Practice • Improve • Get Interview Ready</p>
      </div>

      {questions.length === 0 && !completed && (
        <>
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <br />
          <br />

          <select
            value={topic}
            onChange={(e) =>
              setTopic(e.target.value)
            }
          >
            <option value="python">Python</option>
            <option value="sql">SQL</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="javascript">JavaScript</option>
            <option value="react">React</option>
            <option value="dbms">DBMS</option>
            <option value="oops">OOPS</option>
            <option value="operating system">
              Operating System
            </option>
            <option value="computer networks">
              Computer Networks
            </option>
            <option value="data structures">
              Data Structures
            </option>
          </select>

          <br />
          <br />

          <button onClick={viewHistory}>
            📊 View Interview History
          </button>

          <br />
          <br />

          <button onClick={startInterview}>
            🚀 Start Interview
          </button>
        </>
      )}

      {questions.length > 0 && !completed && (
        <div className="interview-layout">
          <div className="question-panel">
            <h2>
              Question {currentQuestion + 1}
            </h2>

            <div className="timer">
              ⏳ Time Left: {timeLeft}s
            </div>

            <hr />

            <h3>
              {
                questions[currentQuestion]
                  .question
              }
            </h3>

            <div className="question-info">
              <p>
                <strong>Topic:</strong>{" "}
                {topic.toUpperCase()}
              </p>

              <p>
                <strong>Score:</strong>{" "}
                {score}
              </p>

              <p>
                <strong>Progress:</strong>{" "}
                {currentQuestion + 1}/
                {questions.length}
              </p>
            </div>
          </div>

          <div className="answer-panel">
            <h2>Your Answer</h2>

            <textarea
              value={answer}
              placeholder="Type your answer here..."
              onChange={(e) =>
                setAnswer(e.target.value)
              }
            />

            {loading && (
              <p>
                🤖 AI is evaluating your
                answer...
              </p>
            )}

            {feedback && (
              <div className="feedback-box">
                <h3>🤖 AI Evaluation</h3>

                <p>
                  <strong>AI Score:</strong>{" "}
                  {aiScore}/10
                </p>

                <p>
                  <strong>Feedback:</strong>
                </p>

                <p>{feedback}</p>
              </div>
            )}

            <button onClick={nextQuestion}>
              Submit & Next →
            </button>
          </div>
        </div>
      )}

      {completed && (
        <>
          <h2>🎉 Interview Completed</h2>

          <h3 className="score">
            Final Score: {score} / 10
          </h3>

          <h3>
            Percentage: {score * 10}%
          </h3>

          <h3>
            {score >= 8
              ? "⭐⭐⭐⭐ Excellent"
              : score >= 6
              ? "⭐⭐⭐ Good"
              : score >= 4
              ? "⭐⭐ Average"
              : "⭐ Needs Improvement"}
          </h3>

          <button
            onClick={() => {
              setQuestions([]);
              setCurrentQuestion(0);
              setScore(0);
              setCompleted(false);
              setAnswer("");
              setFeedback("");
              setAiScore(0);
              setTimeLeft(60);
            }}
          >
            🔄 Start New Interview
          </button>
        </>
      )}
    </div>
  );
}

export default Interview;