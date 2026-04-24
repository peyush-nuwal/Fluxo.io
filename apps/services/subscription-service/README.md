# Subscription Service

The Subscription Service handles payment order creation and payment verification.

## Default Port

- `4006`

## Base Path

- Internal service: `/api/v1/subscription`

## Endpoints

### Create Order

- Method: `POST`
- Path: `/api/v1/subscription/order`
- Body:

```json
{
  "userId": "user-uuid"
}
```

- Success: `201` with Razorpay order payload.

### Verify Payment

- Method: `POST`
- Path: `/api/v1/subscription/verify`
- Body:

```json
{
  "orderId": "order_xxx",
  "paymentId": "pay_xxx",
  "signature": "signature_hash",
  "userId": "user-uuid"
}
```

- Success: `200` when signature is valid and payment is marked paid.

## Integration

- Razorpay order creation (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)
- Postgres persistence through Drizzle models

## Environment Variables

```env
NODE_ENV=development
PORT=4006
DATABASE_URL=YOUR-NEON-DB-URL
RAZORPAY_KEY_ID=YOUR-RAZORPAY-ID
RAZORPAY_KEY_SECRET=YOUR-RAZORPAY-SECRET
```

## Run

```bash
pnpm -C apps/services/subscription-service dev
pnpm -C apps/services/subscription-service start
```
