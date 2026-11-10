# 💘 Agedate

**Live:** https://agedate.vercel.app

What age is it OK to date? Enter your age and Agedate shows your range by the "half your age plus
seven" rule, then turns it into an image for an Instagram or Facebook story.

A full stack portfolio project of [Štěpán Omelka](https://stepan-omelka-portfolio.vercel.app): an
[Angular](https://angular.dev) frontend and a [Next.js](https://nextjs.org) API in one repo,
deployed together as one Next.js app on [Vercel](https://vercel.com).

| Project                        | What                                                  |
| :----------------------------- | :---------------------------------------------------- |
| [`web`](./web/README.md)       | Angular 22 single-page app: the form and the result   |
| [`api`](./api/README.md)       | Next.js 16 app: renders the story image, serves `web` |
| [`shared`](./shared/README.md) | The dating-range rule, imported by both               |

## 🏛️ Architecture

See [_Architecture_](./ARCHITECTURE.md) for how the projects fit together, the tech stack and the
deployment.

## 🤝 Contributing

See [_Contributing_](./CONTRIBUTING.md) for scripts and Git conventions. To get going:

```sh
npm install   # installs the root, api/ and web/
npm run dev   # both dev servers; open http://localhost:4400
```

## 🔤 Credits

The story image uses [Inter](https://rsms.me/inter/) by Rasmus Andersson, under the SIL Open Font
License ([`api/assets/fonts/OFL.txt`](./api/assets/fonts/OFL.txt)).
