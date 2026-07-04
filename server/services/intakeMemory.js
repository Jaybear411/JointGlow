import { getNextQuestion, intakeQuestions } from "./glowyPrompt.js";

export function applyUserAnswerToMemory(conversation, userMessage) {
  const intake = conversation.intake || {};
  const current = intakeQuestions.find((question) => question.key === conversation.currentQuestion) || getNextQuestion(intake);

  if (current && !intake[current.key]) {
    intake[current.key] = cleanAnswer(userMessage);
  }

  const next = getNextQuestion(intake);
  conversation.intake = intake;
  conversation.currentQuestion = next?.key || "open_chat";
  conversation.status = next ? "active" : "ready_for_review";

  return { intake, nextQuestion: next };
}

function cleanAnswer(value) {
  return String(value || "").trim().slice(0, 1200);
}
