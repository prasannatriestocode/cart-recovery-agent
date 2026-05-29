import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@openai/codex-sdk",
    "@openai/codex",
    "@openai/codex-darwin-arm64",
  ],
};

export default nextConfig;