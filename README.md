# WebSocket Chat on Vercel (Client + Serverless API)

This project is ready to deploy directly from the Vercel dashboard.

## Architecture

- Frontend UI: static files in `html`, `css`, and `js`
- Realtime transport: Pusher Channels
- Server-side publish endpoint: Vercel serverless function in `api/send.js`
- Public config endpoint: `api/config.js`

This means you do not run a persistent WebSocket server on Vercel.
You run a client plus serverless APIs, and Pusher handles persistent realtime connections.

## Deploy from Vercel website

1. Open Vercel dashboard
2. Create a new project from this GitHub repository
3. In Project Settings -> Environment Variables, add:
   - `PUSHER_APP_ID`
   - `PUSHER_APP_KEY`
   - `PUSHER_APP_SECRET`
   - `PUSHER_APP_CLUSTER`
4. Click Deploy

## Quick test

1. Open deployed URL
2. Click `Conectar`
3. Open the same URL in another tab
4. Send a message from one tab
5. Verify the other tab receives it in realtime

## Notes

- Root URL `/` is routed to `html/index.html` via `vercel.json`
- API routes are available at `/api/config` and `/api/send`
- Node runtime for API functions is pinned to `nodejs20.x`
