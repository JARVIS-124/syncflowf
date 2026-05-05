import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api/hubspot': {
        target: 'https://api.hubapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hubspot/, ''),
      },
      '/api/salesforce': {
        target: 'https://login.salesforce.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/salesforce/, ''),
      },
      '/api/quickbooks': {
        target: 'https://quickbooks.api.intuit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/quickbooks/, ''),
      },
      '/api/xero': {
        target: 'https://api.xero.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/xero/, ''),
      },
    },
  },
});
