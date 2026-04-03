import { PlatformAdapter } from "./types";

export const linkedinAdapter: PlatformAdapter = {
  id: "linkedin",
  name: "LinkedIn",
  maxLength: 3000,
  authType: "token",
  credentialFields: [
    {
      key: "accessToken",
      label: "Access Token",
      type: "password",
      placeholder: "OAuth 2.0 access token",
      helpText: "Requires w_member_social scope",
      helpUrl: "https://www.linkedin.com/developers/apps",
    },
  ],

  async verify(credentials) {
    try {
      const res = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!res.ok) {
        return { success: false, error: "Authentication failed" };
      }

      const data = await res.json();
      return { success: true, username: data.name || data.sub };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async post(content, credentials) {
    try {
      // Get user info for author URN
      const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!meRes.ok) {
        return { success: false, error: "Failed to get user info" };
      }

      const me = await meRes.json();
      const authorUrn = `urn:li:person:${me.sub}`;

      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: authorUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: content },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        return {
          success: false,
          error: err.message || "Post failed",
        };
      }

      const data = await res.json();
      const postId = data.id;
      return {
        success: true,
        externalId: postId,
        externalUrl: `https://www.linkedin.com/feed/update/${postId}`,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};
