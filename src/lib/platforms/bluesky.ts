import { PlatformAdapter } from "./types";

export const blueskyAdapter: PlatformAdapter = {
  id: "bluesky",
  name: "Bluesky",
  maxLength: 300,
  authType: "credentials",
  credentialFields: [
    {
      key: "handle",
      label: "Handle",
      type: "text",
      placeholder: "user.bsky.social",
    },
    {
      key: "appPassword",
      label: "App Password",
      type: "password",
      placeholder: "xxxx-xxxx-xxxx-xxxx",
      helpText: "Generate at Settings > App Passwords",
      helpUrl: "https://bsky.app/settings/app-passwords",
    },
  ],

  async verify(credentials) {
    try {
      const res = await fetch(
        "https://bsky.social/xrpc/com.atproto.server.createSession",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: credentials.handle,
            password: credentials.appPassword,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.message || "Authentication failed" };
      }
      const data = await res.json();
      return { success: true, username: data.handle };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async post(content, credentials) {
    try {
      // Create session
      const sessionRes = await fetch(
        "https://bsky.social/xrpc/com.atproto.server.createSession",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: credentials.handle,
            password: credentials.appPassword,
          }),
        }
      );
      if (!sessionRes.ok) {
        return { success: false, error: "Authentication failed" };
      }
      const session = await sessionRes.json();

      // Create post
      const record = {
        $type: "app.bsky.feed.post",
        text: content,
        createdAt: new Date().toISOString(),
      };

      const postRes = await fetch(
        "https://bsky.social/xrpc/com.atproto.repo.createRecord",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessJwt}`,
          },
          body: JSON.stringify({
            repo: session.did,
            collection: "app.bsky.feed.post",
            record,
          }),
        }
      );

      if (!postRes.ok) {
        const err = await postRes.json();
        return { success: false, error: err.message || "Post failed" };
      }

      const postData = await postRes.json();
      const rkey = postData.uri.split("/").pop();
      return {
        success: true,
        externalId: postData.uri,
        externalUrl: `https://bsky.app/profile/${session.handle}/post/${rkey}`,
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};
