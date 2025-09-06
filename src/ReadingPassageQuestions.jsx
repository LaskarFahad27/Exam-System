import React from 'react';
import { Trash2 } from 'lucide-react';

// A dedicated component for rendering reading passage questions
const ReadingPassageQuestions = ({ questions, onRemoveQuestion, loadingRemove }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <h3 className="font-medium p-4 bg-gray-50 border-b border-gray-200">
          Questions for Reading Passage (0)
        </h3>
        <p className="text-center py-6 text-gray-500">No questions added yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <h3 className="font-medium p-4 bg-gray-50 border-b border-gray-200">
        Questions for Reading Passage ({questions.length})
      </h3>
      <div className="divide-y divide-gray-200">
        {questions.map((question, index) => (
          <div key={question.id || index} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-800 font-medium mb-2">
                  {index + 1}. {question.question_text}
                </p>
                <div className="grid grid-cols-1 gap-1 ml-6">
                  {question.options && Array.isArray(question.options) ? (
                    question.options.map((option, idx) => (
                      <div key={idx} className="flex items-center">
                        <div 
                          className={`w-4 h-4 rounded-full mr-2 ${option === question.correct_answer ? 'bg-green-600' : 'bg-gray-200'}`}>
                        </div>
                        <span className={`${option === question.correct_answer ? 'font-medium text-green-700' : ''}`}>
                          {option}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No options available</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemoveQuestion && onRemoveQuestion(question.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                disabled={loadingRemove && loadingRemove[question.id]}
              >
                {loadingRemove && loadingRemove[question.id] ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadingPassageQuestions;
