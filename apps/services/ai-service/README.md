# AI Service

The AI Service generates diagram-ready structured output from user prompts.

## Default Port

- `4004`

## Base Route

- `POST /api/v1/ai/generate-diagram`

## Endpoint

### Generate Diagram

- Method: `POST`
- Path: `/api/v1/ai/generate-diagram`
- Body:

```json
{
  "prompt": "Design a scalable chat application architecture"
}
```

- Success (`200`):

```json
{
  "success": true,
  "message": "Diagram generated successfully",
  "data": {
    "data": {
      "nodes": [],
      "edges": []
    }
  }
}
```

- Common errors:
  - `400` invalid prompt payload
  - `401` unauthorized (if user context missing)
  - `500` generation/parsing failure

## Implementation Notes

- Uses `@google/genai` via service layer.
- Input validated using shared Zod schemas (`packages/zod-schemas`).
- Response wrapped in standardized JSON helper.

## Environment Variables

```env
PORT=4004
GEMINI_API_KEY=YOUR-GEMINI-KEY
```

## Run

```bash
pnpm -C apps/services/ai-service dev
pnpm -C apps/services/ai-service start
```
