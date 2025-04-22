import axios from "axios";
import crypto from "crypto";

let cachedToken = null;
let expiresAt = 0;

/**
 * Retrieve (and cache) an OAuth2 client‑credentials access token from DocuShare
 */
export async function getToken() {
  if (cachedToken && Date.now() < expiresAt) return cachedToken;

  const body = new URLSearchParams({ grant_type: "client_credentials" });
  const { data } = await axios.post(
    `https://${process.env.DS_DOMAIN}/oauth2/token`,
    body.toString(),
    {
      auth: {
        username: process.env.DS_CLIENT_ID,
        password: process.env.DS_CLIENT_SECRET,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );

  cachedToken = data.access_token;
  expiresAt = Date.now() + (data.expires_in - 60) * 1_000; // refresh 1 min early
  return cachedToken;
}

/**
 * Helper to perform authenticated REST calls to DocuShare Flex
 */
async function dsRequest(method, url, options = {}) {
  const token = await getToken();
  return axios({
    method,
    url: `https://${process.env.DS_DOMAIN}${url}`,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
    ...options,
  });
}

export async function list(path = "/Shared/TrialSage") {
  const { data } = await dsRequest("get", `/dsx/v2/objects${encodeURIComponent(path)}`);
  return data.entries;
}

export async function upload(buffer, filename, path = "/Shared/TrialSage") {
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  await dsRequest("post", `/dsx/v2/objects${encodeURIComponent(path)}`, {
    headers: {
      "Content-Type": "application/pdf",
      Slug: filename,
    },
    data: buffer,
  });
  return sha256;
}