// Shared CORS helper for webapp Vercel serverless functions.
// Allows: production webapp, Vercel preview deploys (`mind-compass-webapp-*.vercel.app`),
// and local Vite dev server on :3000.
const ALLOWED_ORIGINS = [
  /^https:\/\/mind-compass-webapp\.vercel\.app$/,
  /^https:\/\/mind-compass-webapp-[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost:3000$/,
];

export function applyCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.some((re) => re.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
