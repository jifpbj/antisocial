import { PlatformAdapter } from "./types";

export const facebookAdapter: PlatformAdapter = {
  id: "facebook",
  name: "Facebook",
  maxLength: 63206,
  authType: "token",
  credentialFields: [
    {
      key: "pageId",
      label: "Page ID",
      type: "text",
      placeholder: "Your Facebook Page ID",
      helpText: "Found in Page Settings > Page transparency",
    },
    {
      key: "accessToken",
      label: "Page Access Token",
      type: "password",
      placeholder: "Long-lived page access token",
      helpText: "Generate via Graph API Explorer",
      helpUrl: "https://developers.facebook.com/tools/explorer/",
    },
  ],

  async verify(credentials) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${credentials.pageId}?fields=name&access_token=${credentials.accessToken}`
      );

      if (!res.ok) {
        const err = await res.json();
        return {
          success: false,
          error: err.error?.message || "Authentication failed",
        };
      }

      const data = await res.json();
      return { success: true, username: data.name };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async post(content, credentials) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${credentials.pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            access_token: credentials.accessToken,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        return {
          success: false,
          error: err.error?.message || "Post failed",
        };
      }

      const data = await res.json();
      return {
        success: true,
        externalId: data.id,
        externalUrl: `https://www.facebook.com/${data.id}`,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};
