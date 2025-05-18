import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import fs from 'fs';

export async function setupViteMinimal(app: express.Application) {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In development, create a Vite dev server
    console.log('Setting up Vite in development mode');
    
    try {
      const vite = await createServer({
        configFile: false,
        root: process.cwd(),
        server: {
          middlewareMode: true,
        },
        plugins: [react()],
        resolve: {
          alias: {
            '@': path.resolve(process.cwd(), './client/src/components'),
            '@shared': path.resolve(process.cwd(), './shared'),
            '@assets': path.resolve(process.cwd(), './attached_assets'),
            '@lib': path.resolve(process.cwd(), './client/src/lib'),
            '@hooks': path.resolve(process.cwd(), './client/src/hooks'),
            '@services': path.resolve(process.cwd(), './client/src/services'),
            '@components': path.resolve(process.cwd(), './client/src/components'),
          },
        },
      });

      // Use Vite's connect instance as middleware
      app.use(vite.middlewares);
      
      // Handle client-side routing for SPA
      app.use('*', async (req, res, next) => {
        const url = req.originalUrl;
        
        try {
          // Special case for client portal
          if (url.startsWith('/client-portal')) {
            const clientPortalPath = path.join(process.cwd(), 'client/public/client-portal-direct.html');
            if (fs.existsSync(clientPortalPath)) {
              let template = fs.readFileSync(clientPortalPath, 'utf-8');
              template = await vite.transformIndexHtml(url, template);
              res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
              return;
            }
          }
          
          // For any other routes, let the next handler deal with it
          next();
        } catch (e) {
          console.error(`Error handling route ${url}:`, e);
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
      
      console.log('Vite middleware setup complete');
    } catch (e) {
      console.error('Failed to setup Vite middleware:', e);
      // Don't throw, just log, so the app can still run with reduced functionality
    }
  } else {
    // In production, serve static files
    app.use('/assets', express.static(path.join(process.cwd(), 'dist/client/assets')));
  }
}