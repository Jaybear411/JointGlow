# JointGlow Glowy App

React + Express app for JointGlow with:

- Premium clinic landing page
- Dedicated `/glowy` chat interface
- MongoDB conversation and intake memory
- OpenAI Responses API integration for Glowy
- Vapi-ready voice call entry point

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the example:

```bash
cp .env.example .env
```

3. Fill in:

```bash
MONGODB_URI=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
VAPI_PUBLIC_KEY=...
VAPI_ASSISTANT_ID=...
```

## Run

```bash
npm run dev
```

Frontend: `http://127.0.0.1:5173`  
Backend: `http://127.0.0.1:8080`

## Production Build

```bash
npm run build
npm run start
```

## API Routes

- `POST /api/chat`
  - Body: `{ "conversationId": "...", "message": "..." }`
  - Stores the message, updates intake memory, calls OpenAI, and returns Glowy's reply.

- `GET /api/chat/:conversationId`
  - Returns stored messages and intake summary.

- `GET /api/vapi/config`
  - Returns Vapi browser configuration.

- `POST /api/vapi/webhook`
  - Placeholder endpoint for Vapi call transcript storage.

## Glowy Intake Flow

Glowy starts with:

```text
Hi, I'm Glowy, what is your name?
```

Then it gathers:

- Name
- Pain area
- Duration
- Pain level
- Goals
- Prior treatments
- Medical context
- Preferred location

Once those are captured, Glowy stops formal intake and continues as a warm concierge chat.

## Vapi Assistant Prompt

Configure your Vapi assistant with the same intent:

```text
You are Glowy, JointGlow's premium patient concierge. Start by saying:
"Hi, I'm Glowy, what is your name?"

Ask one question at a time. Gather name, pain area, duration, pain level, goals,
prior treatments, medical context, and preferred location. Keep responses short,
calm, and easy for an older patient to follow. Do not diagnose or promise outcomes.
If urgent symptoms are mentioned, recommend urgent medical care.
```
