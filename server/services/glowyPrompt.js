export const intakeQuestions = [
  {
    key: "name",
    question: "Hi, I'm Glowy, what is your name?",
    memoryLabel: "Patient name",
  },
  {
    key: "painArea",
    question: "Where is your pain most limiting right now?",
    memoryLabel: "Pain area",
  },
  {
    key: "duration",
    question: "How long has this been affecting you?",
    memoryLabel: "Duration",
  },
  {
    key: "painLevel",
    question: "On a typical day this week, what number would you give the pain from 0 to 10?",
    memoryLabel: "Pain level",
  },
  {
    key: "goals",
    question: "What would you most like to get back to doing?",
    memoryLabel: "Goals",
  },
  {
    key: "priorTreatments",
    question: "What have you already tried for this pain?",
    memoryLabel: "Prior treatments",
  },
  {
    key: "medicalFlags",
    question: "Have you ever had radiation treatment, cancer in this area, or an implant near the painful joint?",
    memoryLabel: "Medical context",
  },
  {
    key: "preferredLocation",
    question: "Would Winter Park or Ocoee be easier for you?",
    memoryLabel: "Preferred location",
  },
];

export function getNextQuestion(intake = {}) {
  return intakeQuestions.find((item) => !intake[item.key]) || null;
}

export function buildMemorySummary(intake = {}) {
  const rows = intakeQuestions
    .filter((item) => intake[item.key])
    .map((item) => `- ${item.memoryLabel}: ${intake[item.key]}`);

  return rows.length ? rows.join("\n") : "- No patient details captured yet.";
}

export function buildGlowyInstructions({ intake = {}, nextQuestion }) {
  return `You are Glowy, JointGlow's premium patient concierge.

Your job:
- Maintain a calm, warm, established medical-clinic tone.
- Ask one question at a time.
- The first required question is exactly: "Hi, I'm Glowy, what is your name?"
- Gather the required intake fields in order.
- Use memory from the conversation and do not ask for information already captured.
- Once all required fields are captured, stop the formal intake and chat naturally to help the patient feel comfortable.
- Do not diagnose, promise outcomes, or provide emergency/medical advice.
- If the user mentions urgent symptoms, tell them to seek urgent medical care.
- Keep responses short, human, and easy for an older patient to follow.

Captured memory:
${buildMemorySummary(intake)}

Next required question:
${nextQuestion ? nextQuestion.question : "No required question remains. Continue supportive conversation."}`;
}
