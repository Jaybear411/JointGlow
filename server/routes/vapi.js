import express from "express";
import Conversation from "../models/Conversation.js";

const router = express.Router();

router.get("/config", async (req, res, next) => {
  try {
    const conversationId = req.query.conversationId;
    let intake = {};

    if (conversationId) {
      const conversation = await Conversation.findById(conversationId).select("intake");
      intake = conversation?.intake || {};
    }

    res.json({
      publicKey: process.env.VAPI_PUBLIC_KEY || "",
      assistantId: process.env.VAPI_ASSISTANT_ID || "",
      firstMessage: "Hi, I'm Glowy, what is your name?",
      variableValues: {
        conversationId: conversationId || "new",
        intakeMemory: JSON.stringify(intake),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/webhook", async (req, res, next) => {
  try {
    const call = req.body?.call || req.body?.message?.call || {};
    const conversationId = call?.metadata?.conversationId || req.body?.conversationId;
    const transcript = req.body?.transcript || req.body?.message?.transcript;
    const callId = call?.id || req.body?.callId;

    if (conversationId && transcript) {
      await Conversation.findByIdAndUpdate(conversationId, {
        $push: {
          messages: { role: "assistant", content: `[Voice transcript] ${transcript}` },
          ...(callId ? { vapiCallIds: callId } : {}),
        },
      });
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
