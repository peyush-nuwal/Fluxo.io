# ⚙️ Fluxo AI Service

> **Part of the Fluxor.io ecosystem** — powering AI-driven functionality such as diagram generation, intelligent system design, and structured data generation.

---

## 1. 🚀 Overview

The **Fluxo AI Service** acts as the intelligent processing layer within the Fluxor.io architecture.  
It handles prompt validation, communicates with external AI providers (currently **Google Gemini**), and returns structured JSON data — primarily system design diagrams and workflow blueprints.

This service ensures all AI interactions are clean, validated, and consistent for other Fluxo components to consume.

---

## 2. 🧩 Architecture

```text
Client → API Gateway → AI Service → Gemini API → JSON Response
```

- Frontend sends prompts via API Gateway.
- AI Service validates and formats the prompt.
- The request is sent to Gemini API for processing.
- Gemini returns structured JSON.
- AI Service validates, parses, and returns the result upstream.
- All interactions are logged using Winston.

---

## 3. Key Responsibilities

- Validate and sanitize incoming AI prompts
- Format and forward requests to Gemini
- Parse and validate AI responses into JSON
- Log and track AI lifecycle events
- Handle network, timeout, and API errors gracefully

---

## 4. API Endpoints

POST `/api/v1/ai/generate-diagram`
Description: Generates a diagram JSON structure based on the input prompt.

**Request body:**

```
{ "prompt": "Create a system design for a todo app" }
```

**Response:**

```
{
  "nodes": [
    { "id": "frontend", "label": "React App", "type": "frontend" },
    { "id": "api", "label": "Express API", "type": "backend" },
    { "id": "db", "label": "PostgreSQL", "type": "database" }
  ],
  "edges": [
    { "from": "frontend", "to": "api" },
    { "from": "api", "to": "db" }
  ]
}

```

Errors:

| Code  | Meaning                                  |
| ----- | ---------------------------------------- |
| `400` | Missing or invalid prompt                |
| `429` | Rate limit or quota exceeded             |
| `500` | Failed to generate or parse diagram JSON |

---

## 5. Configuration & Environment

---

| Variable         | Description             | Example                  |
| :--------------- | :---------------------- | :----------------------- |
| `PORT`           | `Port for AI Service`   | 4004                     |
| `GEMINI_API_KEY` | `API key for Google AI` | AIza....                 |
| `LOG_LEVEL`      | `Logging verbosity`     | info or debug            |
| `NODE_ENV`       | `Environment`           | development / production |

## 6. Setup & Local Development

1. **Clone the repository**

```bash
  git clone https://github.com/peyush-nuwal/Fluxo.io
  cd fluxo/apps/services/ai-service
```

2. **Install dependencies**

```bash
  pnpm install
```

> Use `yarn` or `npm` if preferred.

3. **Set up environment variables**

   Copy `.env.example` to `.env` and configure (see [Environment Variables](#-environment-variables)).

4. **Launch the development server**

```bash
  pnpm dev
```

5. **Test the endpoint**

```bash
  http POST :4004/api/v1/ai/generate-diagram prompt="Create a system design for a todo app"

```

## 7. 🪵 Logging & Error Handling

- **Logger:** [Winston](https://github.com/winstonjs/winston) — used for structured and configurable application logging.
- **Log Levels:** `info`, `warn`, `error`, `debug`
- **Error Handling:** Centralized within `try/catch` blocks for all async operations, ensuring consistent error responses.
- **Structured Logs:** Every log entry includes timestamps, service name, and detailed error context for better observability and debugging.
