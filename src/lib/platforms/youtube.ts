import { PlatformAdapter } from "./types";

export const youtubeAdapter: PlatformAdapter = {
  id: "youtube",
  name: "YouTube",
  maxLength: null,
  authType: "manual",
  credentialFields: [],

  async verify() {
    return { success: true, username: "Manual — opens YouTube" };
  },

  async post(content) {
    return {
      success: true,
      manualUrl: "https://www.youtube.com/",
    };
  },
};
