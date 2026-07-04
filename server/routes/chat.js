import express from "express";
import { applyUserAnswerToMemory } from "../services/intakeMemory.js";
import { buildGlowyInstructions } from "../services/glowyPrompt.js";
import { createGlowyReply } from "../services/openaiClient.js";
import { createConversation, getConversation, saveConversation } from "../services/conversationStore.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { conversationId, message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    let conversation = await getConversation(conversationId);
    if (!conversation) {
      conversation = await createConversation({
        source: "chat",
        messages: [{ role: "assistant", content: "Hi, I'm Glowy, what is your name?" }],
      });
    }

    conversation.messages.push({ role: "user", content: message });
    const { nextQuestion } = applyUserAnswerToMemory(conversation, message);

    const instructions = buildGlowyInstructions({
      intake: conversation.intake,
      nextQuestion,
    });

    const modelMessages = conversation.messages.slice(-14);
    const reply = await createGlowyReply({ instructions, messages: modelMessages });

    conversation.messages.push({ role: "assistant", content: reply });
    await saveConversation(conversation);

    res.json({
      conversationId: conversation._id,
      reply,
      intake: conversation.intake,
      status: conversation.status,
      nextQuestion: nextQuestion?.key || null,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:conversationId", async (req, res, next) => {
  try {
    const conversation = await getConversation(req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    res.json({
      conversationId: conversation._id,
      messages: conversation.messages,
      intake: conversation.intake,
      status: conversation.status,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
