# Services

This folder contains Fluxo backend microservices.

## Services at a Glance

| Service              | Port   | Main Base Path         | Docs                                       |
| -------------------- | ------ | ---------------------- | ------------------------------------------ |
| Auth Service         | `4001` | `/api/v1/auth`         | [README](./auth-service/README.md)         |
| Diagram Service      | `4002` | `/api/v1`              | [README](./diagram-service/README.md)      |
| AI Service           | `4004` | `/api/v1/ai`           | [README](./ai-service/README.md)           |
| Subscription Service | `4006` | `/api/v1/subscription` | [README](./subscription-service/README.md) |

## Notes

- Services are accessed externally through the API Gateway (`apps/api-gateway`).
- Auth is the source of truth for identity and JWT issuance.
- Diagram service depends on auth service for collaborator profile enrichment (`/users/bulk-by-email`).
