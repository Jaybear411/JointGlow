const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

export async function createGlowyReply({ instructions, messages }) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackReply(messages);
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions,
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return extractText(data) || "Thank you. Tell me a little more.";
}

function extractText(response) {
  if (response.output_text) return response.output_text;

  return (response.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function fallbackReply(messages) {
  const last = messages[messages.length - 1]?.content || "";
  if (!last) return "Hi, I'm Glowy, what is your name?";
  return "Thank you. I have that noted. Tell me a little more so I can prepare a clear summary for your specialist.";
}
