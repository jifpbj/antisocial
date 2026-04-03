import { PlatformAdapter } from "./types";
import { blueskyAdapter } from "./bluesky";
import { twitterAdapter } from "./twitter";
import { githubAdapter } from "./github";
import { facebookAdapter } from "./facebook";
import { linkedinAdapter } from "./linkedin";
import { threadsAdapter } from "./threads";
import { instagramAdapter } from "./instagram";
import { youtubeAdapter } from "./youtube";
import { substackAdapter } from "./substack";

export const platformRegistry: Record<string, PlatformAdapter> = {
  bluesky: blueskyAdapter,
  twitter: twitterAdapter,
  github: githubAdapter,
  facebook: facebookAdapter,
  linkedin: linkedinAdapter,
  threads: threadsAdapter,
  instagram: instagramAdapter,
  youtube: youtubeAdapter,
  substack: substackAdapter,
};

export const platformOrder = [
  "bluesky",
  "twitter",
  "facebook",
  "instagram",
  "threads",
  "linkedin",
  "youtube",
  "github",
  "substack",
];
