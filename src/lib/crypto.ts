import crypto from "crypto";
import fs from "fs";
import path from "path";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const envPath = path.join(process.cwd(), ".env");

  let key = process.env.ENCRYPTION_KEY;

  if (!key) {
    // Generate a new key and write it to .env
    key = crypto.randomBytes(32).toString("hex");
    const envContent = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, "utf-8")
      : "";
    fs.writeFileSync(envPath, envContent + `\nENCRYPTION_KEY=${key}\n`);
    process.env.ENCRYPTION_KEY = key;
  }

  return Buffer.from(key, "hex");
}

export function encrypt(plaintext: string): {
  ciphertext: string;
  iv: string;
  tag: string;
} {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decrypt(
  ciphertext: string,
  iv: string,
  tag: string
): string {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(tag, "hex"));

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
