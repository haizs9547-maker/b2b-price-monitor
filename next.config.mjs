/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // The restricted Windows build environment allows threads in place of child processes.
  ...(process.platform === "win32" && {
    experimental: { workerThreads: true, useTypeScriptCli: false, cpus: 2 },
  }),
};

export default nextConfig;
