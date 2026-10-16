import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [{
    name: 'admin-trailing-slash',
    configureServer(server) { server.middlewares.use(redirectAdmin); },
    configurePreviewServer(server) { server.middlewares.use(redirectAdmin); },
  }],
  base: process.env.PAGES_BASE_PATH || '/',
  build: { rollupOptions: { input: {
    main: fileURLToPath(new URL('./index.html', import.meta.url)),
    admin: fileURLToPath(new URL('./admin/index.html', import.meta.url)),
  } } },
});

function redirectAdmin(req, res, next) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.endsWith('/admin')) {
    res.writeHead(302, { Location: `${url.pathname}/${url.search}` });
    res.end();
  } else next();
}
