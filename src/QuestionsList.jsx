import React from "react";

const QuestionsList = ({ activeSection, examForm, removeQuestion }) => {
  const questions = Array.isArray(examForm[activeSection]?.questions)
    ? examForm[activeSection].questions
    : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Questions
      </h2>

      {questions.length === 0 ? (
        <p className="text-gray-500 italic">No questions added yet.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q, index) => (
            <li
              key={q.id}
              className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
            >
              <div>
                <p className="font-medium">
                  {index + 1}. {q.question}
                </p>
                <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={
                        q.correctAnswer === opt ? "font-bold text-green-600" : ""
                      }
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => removeQuestion(activeSection, q.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionsList;
