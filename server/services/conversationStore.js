import crypto from "node:crypto";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";

const memoryConversations = new Map();

export function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

export async function getConversation(conversationId) {
  if (!conversationId) return null;

  if (isMongoReady() && mongoose.Types.ObjectId.isValid(conversationId)) {
    return Conversation.findById(conversationId);
  }

  return memoryConversations.get(conversationId) || null;
}

export async function createConversation(attributes = {}) {
  if (isMongoReady()) {
    return Conversation.create(attributes);
  }

  const conversation = {
    _id: crypto.randomUUID(),
    source: attributes.source || "chat",
    status: attributes.status || "active",
    currentQuestion: attributes.currentQuestion || "name",
    intake: attributes.intake || {},
    messages: attributes.messages || [],
    vapiCallIds: attributes.vapiCallIds || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryConversations.set(String(conversation._id), conversation);
  return conversation;
}

export async function saveConversation(conversation) {
  if (typeof conversation?.save === "function") {
    return conversation.save();
  }

  conversation.updatedAt = new Date();
  memoryConversations.set(String(conversation._id), conversation);
  return conversation;
}

export async function getConversationIntake(conversationId) {
  const conversation = await getConversation(conversationId);
  return conversation?.intake || {};
}

export async function appendVoiceTranscript({ conversationId, transcript, callId }) {
  const conversation = await getConversation(conversationId);
  if (!conversation) return null;

  conversation.messages.push({
    role: "assistant",
    content: `[Voice transcript] ${transcript}`,
  });

  if (callId) {
    conversation.vapiCallIds = conversation.vapiCallIds || [];
    conversation.vapiCallIds.push(callId);
  }

  return saveConversation(conversation);
}
