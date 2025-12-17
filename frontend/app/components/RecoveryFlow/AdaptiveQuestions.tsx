/**
 * Adaptive Questions Component
 * 
 * Displays adaptive security questions based on risk assessment
 */

'use client';

import { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import { AdaptiveQuestion } from '../../lib/aiVerification';

interface AdaptiveQuestionsProps {
  questions: AdaptiveQuestion[];
  onSubmit: (answers: Record<string, string>) => void;
  onSkip?: () => void;
  loading?: boolean;
}

export default function AdaptiveQuestions({
  questions,
  onSubmit,
  onSkip,
  loading = false,
}: AdaptiveQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnsweredAllRequired = questions.every(
    (q) => !q.required || answers[q.id]
  );

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear error for this question
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateCurrentQuestion = (): boolean => {
    if (currentQuestion.required && !answers[currentQuestion.id]?.trim()) {
      setErrors((prev) => ({
        ...prev,
        [currentQuestion.id]: 'This question is required',
      }));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (validateCurrentQuestion() && hasAnsweredAllRequired) {
      onSubmit(answers);
    }
  };

  const renderQuestion = (question: AdaptiveQuestion) => {
    const value = answers[question.id] || '';
    const error = errors[question.id];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  value === option
                    ? 'border-brand-primary-500 bg-brand-primary-500/10'
                    : 'border-dark-border-primary bg-dark-bg-secondary hover:border-dark-border-accent'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    value === option
                      ? 'border-brand-primary-500'
                      : 'border-dark-border-primary'
                  }`}
                >
                  {value === option && (
                    <div className="w-2 h-2 rounded-full bg-brand-primary-500" />
                  )}
                </div>
                <span className="text-dark-text-primary">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.hint || 'Enter your answer'}
              className={`w-full px-4 py-3 bg-dark-bg-tertiary border rounded-lg text-dark-text-primary placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition-all ${
                error ? 'border-brand-error-500' : 'border-dark-border-primary'
              }`}
              autoFocus
            />
            {question.hint && (
              <p className="mt-2 text-sm text-dark-text-tertiary">{question.hint}</p>
            )}
            {error && (
              <p className="mt-2 text-sm text-brand-error-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-3">
            <label className="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all border-dark-border-primary bg-dark-bg-secondary hover:border-dark-border-accent">
              <input
                type="checkbox"
                checked={value === 'confirmed'}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.checked ? 'confirmed' : '')
                }
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  value === 'confirmed'
                    ? 'border-brand-primary-500 bg-brand-primary-500'
                    : 'border-dark-border-primary bg-transparent'
                }`}
              >
                {value === 'confirmed' && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-dark-text-primary">{question.question}</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between text-sm text-dark-text-tertiary">
          <span>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
          <div
            className="bg-brand-primary-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <div>
          <h3 className="text-xl font-semibold text-dark-text-primary mb-4">
            {currentQuestion.question}
            {currentQuestion.required && (
              <span className="text-brand-error-500 ml-1">*</span>
            )}
          </h3>

          {renderQuestion(currentQuestion)}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-border-primary">
          <div>
            {currentQuestionIndex > 0 && (
              <Button variant="ghost" onClick={handlePrevious} disabled={loading}>
                ← Previous
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {onSkip && !currentQuestion.required && (
              <Button variant="outline" onClick={onSkip} disabled={loading}>
                Skip
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={loading || (currentQuestion.required && !answers[currentQuestion.id])}
              loading={loading && isLastQuestion}
            >
              {isLastQuestion ? 'Submit Answers' : 'Next'}
            </Button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-dark-text-tertiary text-center">
          These questions help verify your identity and protect your account
        </p>
      </div>
    </Card>
  );
}
