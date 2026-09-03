# url-shortener-frontend

Dashboard for the URL Shortener.

- Design: [DESIGN.md](./DESIGN.md)
- Conventions: [CLAUDE.md](./CLAUDE.md)
- Contract: `contracts/openapi.yaml`, vendored from [url-shortener-kb](https://github.com/kamikaze011001/url-shortener-kb)

```bash
npm install
npm run dev     # :5173, proxies /api to the backend on :8080
npm run check   # typecheck + lint + format
```
