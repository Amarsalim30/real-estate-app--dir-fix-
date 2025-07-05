import withFlowbiteReact from "flowbite-react/plugin/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'], // Or your backend domain like 'api.example.com'
  },
};

export default withFlowbiteReact(nextConfig);
