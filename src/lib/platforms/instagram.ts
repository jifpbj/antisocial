import { PlatformAdapter } from "./types";

export const instagramAdapter: PlatformAdapter = {
  id: "instagram",
  name: "Instagram",
  maxLength: null,
  authType: "manual",
  credentialFields: [],

  async verify() {
    return { success: true, username: "Manual — opens Instagram" };
  },

  async post(content) {
    return {
      success: true,
      manualUrl: "https://www.instagram.com/",
    };
  },
};
