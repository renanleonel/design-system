import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The /mcp route reads these committed files at request time, so they must
  // be traced into its serverless function (see app/mcp/data.ts).
  outputFileTracingIncludes: {
    "/mcp": [
      "./public/r/**/*.json",
      "./registry/catalog.json",
      "./registry/changelog.json",
      "./docs/*.md",
      "./components/demos/*.tsx",
    ],
  },
  // The compositions that lived at /examples are now on the home page.
  redirects: async () => [
    { source: "/examples", destination: "/", permanent: true },
  ],
}

export default nextConfig
