# Vercel Clone

> [!WARNING]  
> This repo is not meant for production. Please use it with caution.

This repo contains code for my video where I code-along a vercel-like deployment service. This is meant to be coded in a beginner friendly way and not for ready for production use.

See [my youtube video](https://www.youtube.com/watch?v=c8_tafixiAs) to follow along the code.

## Tech Stack

This is not a monorepo and each folder is a seperate service. Folder names should be self-explanatory. For backend I've used following tech, for packages, you could also check package.json.

- AWS : Used extensively, to deploy, run, store code.
- Redis: Used for storing project status etc
- Zod: Used for checking user input

For frontend

- React
- Tailwind and Radix UI
- Vite for bundling

## Running the code

For frontend, do `npm install` and `npm run dev` to start vite server.

For `vercel-upload-service` set the AWS secret values in `.env` file before running the project and building it. Just do `npm install` and `npx ts-node-dev src/index.ts` or you can also build it using `tsc` or `esbuild` etc.
