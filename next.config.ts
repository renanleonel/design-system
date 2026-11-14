import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The compositions that lived at /examples are now on the home page.
  redirects: async () => [
    { source: "/examples", destination: "/", permanent: true },
  ],
}

export default nextConfig
