# Avatar Generator

---
## Vercel environments
Current environment (right now **production** is not in use):
- [Production](https://avatar-generator-metagamehub.vercel.app)
- [Dev Preview](https://avatar-generator-git-dev-metagamehub.vercel.app)
---
## URL Parameters
This parameters are to be added at the end of the web app url, after a `?` symbol and multiple parameters concatenated by `&` symbol.

Example: `https://web-app.url?parameter1=value1&parameter2=value2`

### Campaign Parameter:
We can send campaign to use on the app, campaigns have a set of default configurations, instructions and values to use on the app.

To use: `campaign=value`

Current campaign to use is `decentraland` (base campaign is missing configurations in order to be more usable).


### Config Parameter:

---
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
