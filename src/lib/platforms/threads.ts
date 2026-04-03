import { PlatformAdapter } from "./types";

export const threadsAdapter: PlatformAdapter = {
  id: "threads",
  name: "Threads",
  maxLength: 500,
  authType: "token",
  credentialFields: [
    {
      key: "userId",
      label: "User ID",
      type: "text",
      placeholder: "Your Threads/Instagram user ID",
    },
    {
      key: "accessToken",
      label: "Access Token",
      type: "password",
      placeholder: "Threads API access token",
      helpText: "Requires threads_content_publish scope",
      helpUrl: "https://developers.facebook.com/docs/threads/get-started",
    },
  ],

  async verify(credentials) {
    try {
      const res = await fetch(
        `https://graph.threads.net/v1.0/${credentials.userId}?fields=username&access_token=${credentials.accessToken}`
      );

      if (!res.ok) {
        const err = await res.json();
        return {
          success: false,
          error: err.error?.message || "Authentication failed",
        };
      }

      const data = await res.json();
      return { success: true, username: `@${data.username}` };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async post(content, credentials) {
    try {
      // Step 1: Create container
      const containerRes = await fetch(
        `https://graph.threads.net/v1.0/${credentials.userId}/threads`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            media_type: "TEXT",
            text: content,
            access_token: credentials.accessToken,
          }),
        }
      );

      if (!containerRes.ok) {
        const err = await containerRes.json();
        return {
          success: false,
          error: err.error?.message || "Container creation failed",
        };
      }

      const container = await containerRes.json();

      // Step 2: Publish
      const publishRes = await fetch(
        `https://graph.threads.net/v1.0/${credentials.userId}/threads_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: container.id,
            access_token: credentials.accessToken,
          }),
        }
      );

      if (!publishRes.ok) {
        const err = await publishRes.json();
        return {
          success: false,
          error: err.error?.message || "Publish failed",
        };
      }

      const published = await publishRes.json();
      return {
        success: true,
        externalId: published.id,
        externalUrl: `https://www.threads.net/post/${published.id}`,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};
