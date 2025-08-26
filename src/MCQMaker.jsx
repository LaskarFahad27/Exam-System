import React, { useState } from "react";
import toastService from './utils/toast.jsx';

const MCQMaker = ({ activeSection, addQuestion }) => {
  const [questionForm, setQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: null,
  });

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...questionForm.options];
    updatedOptions[index] = value;
    setQuestionForm({ ...questionForm, options: updatedOptions });
  };

  const handleAddQuestion = () => {
    if (!questionForm.question.trim()) {
      toastService.error("Please enter a question!");
      return;
    }

    const newQuestion = {
      id: Date.now(),
      question: questionForm.question,
      options: questionForm.options,
      correctAnswer: questionForm.correctAnswer,
    };

    addQuestion(activeSection, newQuestion);

    // reset form
    setQuestionForm({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: null,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        Add {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Question
      </h2>

      <input
        type="text"
        placeholder="Enter your question"
        value={questionForm.question}
        onChange={(e) =>
          setQuestionForm({ ...questionForm, question: e.target.value })
        }
        className="w-full border p-2 mb-4 rounded"
      />

      {questionForm.options.map((opt, index) => (
        <div key={index} className="flex items-center mb-2">
          <input
            type="text"
            placeholder={`Option ${index + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className="flex-1 border p-2 rounded mr-2"
          />
          <input
            type="radio"
            name="correctAnswer"
            checked={questionForm.correctAnswer === questionForm.options[index]}
            onChange={() =>
              setQuestionForm({ ...questionForm, correctAnswer: questionForm.options[index] })
            }
          />
        </div>
      ))}

      <button
        onClick={handleAddQuestion}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Add Question
      </button>
    </div>
  );
};

export default MCQMaker;
