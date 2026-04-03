import { PlatformAdapter } from "./types";

export const substackAdapter: PlatformAdapter = {
  id: "substack",
  name: "Substack",
  maxLength: null,
  authType: "manual",
  credentialFields: [],

  async verify() {
    return { success: true, username: "Manual — opens Substack Notes" };
  },

  async post(content) {
    return {
      success: true,
      manualUrl: "https://substack.com/notes",
    };
  },
};
