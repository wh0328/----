import crypto from "crypto";
export const config = {
  runtime: 'nodejs18.x'
};

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

export default function handler(req, res) {
  const appId = process.env.XF_APP_ID;
  const apiKey = process.env.XF_API_KEY;
  const apiSecret = process.env.XF_API_SECRET;

  if (!appId || !apiKey || !apiSecret) {
    res.status(500).json({ error: "Missing XF_APP_ID / XF_API_KEY / XF_API_SECRET" });
    return;
  }

  try {
    const url = buildAuthUrl(apiKey, apiSecret);
    res.status(200).json({
      url,
      app_id: appId
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
