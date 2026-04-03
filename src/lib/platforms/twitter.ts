import OAuth from "oauth-1.0a";
import crypto from "crypto";
import { PlatformAdapter } from "./types";

function createOAuthClient(credentials: Record<string, string>) {
  return new OAuth({
    consumer: {
      key: credentials.apiKey,
      secret: credentials.apiSecret,
    },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
      return crypto.createHmac("sha1", key).update(baseString).digest("base64");
    },
  });
}

export const twitterAdapter: PlatformAdapter = {
  id: "twitter",
  name: "Twitter / X",
  maxLength: 280,
  authType: "credentials",
  credentialFields: [
    {
      key: "apiKey",
      label: "API Key",
      type: "password",
      placeholder: "Consumer API key",
      helpText: "From developer.x.com",
      helpUrl: "https://developer.x.com/en/portal/dashboard",
    },
    {
      key: "apiSecret",
      label: "API Secret",
      type: "password",
      placeholder: "Consumer API secret",
    },
    {
      key: "accessToken",
      label: "Access Token",
      type: "password",
      placeholder: "User access token",
    },
    {
      key: "accessTokenSecret",
      label: "Access Token Secret",
      type: "password",
      placeholder: "User access token secret",
    },
  ],

  async verify(credentials) {
    try {
      const oauth = createOAuthClient(credentials);
      const url = "https://api.twitter.com/2/users/me";
      const authHeader = oauth.toHeader(
        oauth.authorize({ url, method: "GET" }, {
          key: credentials.accessToken,
          secret: credentials.accessTokenSecret,
        })
      );

      const res = await fetch(url, {
        headers: { Authorization: authHeader.Authorization },
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.detail || "Authentication failed" };
      }

      const data = await res.json();
      return { success: true, username: `@${data.data.username}` };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async post(content, credentials) {
    try {
      const oauth = createOAuthClient(credentials);
      const url = "https://api.twitter.com/2/tweets";
      const authHeader = oauth.toHeader(
        oauth.authorize({ url, method: "POST" }, {
          key: credentials.accessToken,
          secret: credentials.accessTokenSecret,
        })
      );

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader.Authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: content }),
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.detail || err.title || "Post failed" };
      }

      const data = await res.json();
      return {
        success: true,
        externalId: data.data.id,
        externalUrl: `https://x.com/i/status/${data.data.id}`,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};
