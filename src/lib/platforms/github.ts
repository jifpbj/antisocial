import { PlatformAdapter } from "./types";

export const githubAdapter: PlatformAdapter = {
  id: "github",
  name: "GitHub",
  maxLength: null,
  authType: "token",
  credentialFields: [
    {
      key: "token",
      label: "Personal Access Token",
      type: "password",
      placeholder: "ghp_...",
      helpText: "Needs 'gist' scope",
      helpUrl: "https://github.com/settings/tokens/new?scopes=gist",
    },
  ],

  async verify(credentials) {
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${credentials.token}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (!res.ok) {
        return { success: false, error: "Invalid token" };
      }

      const data = await res.json();
      return { success: true, username: `@${data.login}` };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async post(content, credentials) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const res = await fetch("https://api.github.com/gists", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: content.slice(0, 256),
          public: true,
          files: {
            [`post-${timestamp}.md`]: { content },
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.message || "Gist creation failed" };
      }

      const data = await res.json();
      return {
        success: true,
        externalId: data.id,
        externalUrl: data.html_url,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};
