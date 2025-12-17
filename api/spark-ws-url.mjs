import crypto from "crypto";

// Vercel API function for Spark AI WebSocket URL generation
export default async function handler(req, res) {

function rfc1123Date() {
  return new Date().toUTCString();
}
//rebuilded
function buildAuthUrl(apiKey, apiSecret) {
  const host = "spark-api.xf-yun.com";
  const path = "/v1/x1"; // X1.5 WebSocket
  const date = rfc1123Date();

  const signStr =
    `host: ${host}\n` +
    `date: ${date}\n` +
    `GET ${path} HTTP/1.1`;

  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(signStr)
    .digest("base64");

  const authorizationOrigin =
    `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

  const authorization = Buffer.from(authorizationOrigin).toString("base64");

  const params = new URLSearchParams({
    authorization,
    date,
    host
  });

  return `wss://${host}${path}?${params.toString()}`;
}

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const appId = process.env.XF_APP_ID;
  const apiKey = process.env.XF_API_KEY;
  const apiSecret = process.env.XF_API_SECRET;

  if (!appId || !apiKey || !apiSecret) {
    res.status(500).json({
      error: "Missing XF_APP_ID / XF_API_KEY / XF_API_SECRET",
      details: "Please set environment variables in Vercel dashboard"
    });
    return;
  }

  try {
    const url = buildAuthUrl(apiKey, apiSecret);
    res.status(200).json({
      url,
      app_id: appId,
      success: true
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
      success: false
    });
  }
}
