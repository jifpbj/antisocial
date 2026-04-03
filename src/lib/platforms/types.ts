export interface CredentialField {
  key: string;
  label: string;
  type: "text" | "password";
  placeholder?: string;
  helpText?: string;
  helpUrl?: string;
}

export interface VerifyResult {
  success: boolean;
  username?: string;
  error?: string;
}

export interface PostResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
  /** For manual platforms: URL to open in browser */
  manualUrl?: string;
}

export interface PlatformAdapter {
  id: string;
  name: string;
  maxLength: number | null;
  authType: "credentials" | "token" | "manual";
  credentialFields: CredentialField[];
  verify(credentials: Record<string, string>): Promise<VerifyResult>;
  post(content: string, credentials: Record<string, string>): Promise<PostResult>;
}
