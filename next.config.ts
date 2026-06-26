import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure knowledge-base files are bundled into each serverless function.
  // Without this, Vercel's file-system tracing won't include .md files and
  // the RAG pipeline will silently return no context in production.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experimental: {
    // Ensure knowledge-base .md files are bundled into each serverless
    // function on Vercel — without this the RAG pipeline returns nothing.
    outputFileTracingIncludes: {
      "/api/generate-testcases": ["./knowledge-base/**/*"],
      "/api/generate-testdata": ["./knowledge-base/**/*"],
      "/api/analyze-defect": ["./knowledge-base/**/*"],
    },
  } as any,
};

export default nextConfig;
