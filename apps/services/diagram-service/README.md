# Diagram Service

The Diagram Service manages projects, diagrams, likes, visibility, and collaboration/invitations.

## Default Port

- `4002`

## Base Path

- Internal service base: `/api/v1`
- Usually accessed through gateway:
  - `/api/v1/diagram/*`
  - Backward-compatible aliases: `/api/v1/projects/*`, `/api/v1/diagrams/*`, `/api/v1/invitations/*`

## Auth Context

The service expects identity headers forwarded by gateway:

- `x-user-id`
- `x-user-email`

Middleware maps these into `req.user`.

## API Endpoints

### Projects

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:id`
- `PUT /api/v1/projects/:id`
- `DELETE /api/v1/projects/:id`

### Diagrams

- `GET /api/v1/projects/:projectId/diagrams`
- `GET /api/v1/diagrams`
- `GET /api/v1/diagrams/trash`
- `GET /api/v1/diagrams/:diagramId`
- `GET /api/v1/diagrams/:diagramId/public`
- `POST /api/v1/diagrams`
- `PUT /api/v1/diagrams/:diagramId`
- `DELETE /api/v1/diagrams/:diagramId` (soft delete)
- `PATCH /api/v1/diagrams/:diagramId/restore`
- `DELETE /api/v1/admin/diagrams/:diagramId` (hard delete)
- `GET /api/v1/diagrams/:diagramId/ownership`
- `PATCH /api/v1/diagrams/:diagramId/active`
- `POST /api/v1/diagrams/:diagramId/like`
- `GET /api/v1/diagrams/:diagramId/like`
- `PATCH /api/v1/diagrams/:diagramId/visibility`

### Collaborators

Preferred project-scoped routes:

- `GET /api/v1/projects/:projectId/collaborators`
- `POST /api/v1/projects/:projectId/collaborators`
- `DELETE /api/v1/projects/:projectId/collaborators`
- `GET /api/v1/projects/:projectId/collaborators/pending`

Backward-compatible aliases:

- `GET /api/v1/diagrams/:projectId/collaborators`
- `POST /api/v1/diagrams/:projectId/collaborators`
- `DELETE /api/v1/diagrams/:projectId/collaborators`

### Invitations

- `POST /api/v1/invitations/accept`
- `GET /api/v1/invitations/accept`
- `POST /api/v1/projects/invitations/accept`
- `GET /api/v1/projects/invitations/accept`

## Uploads

Project/diagram create and update endpoints support multipart uploads through fields:

- `thumbnail`
- `thumbnail_url`

Upload limit: `2MB` per file.

## Environment Variables

```env
PORT=4002
DATABASE_URL=YOUR-NEON-DB-URL
JWT_SECRET=supersecret
SUPABASE_URL=YOUR-SUPABASE-URL
SUPABASE_SERVICE_ROLE_KEY=YOUR-SUPABASE-SERVICE-ROLE-KEY
SUPABASE_THUMBNAIL_BUCKET=fluxo-thumbnail
REDIS_URL=YOUR-REDIS-URL
REDIS_PORT=YOUR-REDIS-PORT
REDIS_PASSWORD=YOUR-REDIS-PASSWORD
EMAIL_SERVICE=gmail
EMAIL_FROM=EMAIL-USER-ID
EMAIL_USER=EMAIL-YOU-WANT-SEND-MAIL-FROM
EMAIL_PASSWORD=your-email-password
EMAIL_DOMAIN=gmail.com
AUTH_SERVICE_URL=http://localhost:4001
INTERNAL_SERVICE_TOKEN=CHANGE-THIS-TO-THE-SAME-SECRET-AS-AUTH-SERVICE
AUTH_USERS_TIMEOUT_MS=1500
USER_PROFILE_CACHE_TTL_SECONDS=600
```

## Run

```bash
pnpm -C apps/services/diagram-service dev
pnpm -C apps/services/diagram-service start
```
