import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["system", "user", "assistant", "tool"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false, timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["chat", "voice"],
      default: "chat",
    },
    status: {
      type: String,
      enum: ["active", "ready_for_review", "closed"],
      default: "active",
    },
    currentQuestion: {
      type: String,
      default: "name",
    },
    intake: {
      name: String,
      painArea: String,
      duration: String,
      painLevel: String,
      goals: String,
      priorTreatments: String,
      medicalFlags: String,
      preferredLocation: String,
    },
    messages: [messageSchema],
    vapiCallIds: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
