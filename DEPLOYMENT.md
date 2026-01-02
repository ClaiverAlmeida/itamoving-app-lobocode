# 🚀 ITAMOVING - Guia de Deploy e Produção

## 📋 Índice

1. [Preparação para Produção](#preparação-para-produção)
2. [Build de Produção](#build-de-produção)
3. [Deploy em Vercel](#deploy-em-vercel)
4. [Deploy em Netlify](#deploy-em-netlify)
5. [Deploy em AWS](#deploy-em-aws)
6. [Deploy com Docker](#deploy-com-docker)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)
8. [CI/CD com GitHub Actions](#cicd-com-github-actions)
9. [Monitoramento](#monitoramento)
10. [Backup e Recuperação](#backup-e-recuperação)
11. [Manutenção](#manutenção)

---

## 🔧 Preparação para Produção

### Checklist Pré-Deploy

- [ ] **Código**
  - [ ] Sem console.logs desnecessários
  - [ ] Sem comentários TODO pendentes
  - [ ] Tipos TypeScript sem erros
  - [ ] Build sem warnings
  
- [ ] **Performance**
  - [ ] Imagens otimizadas
  - [ ] Code splitting implementado
  - [ ] Lazy loading de componentes
  - [ ] Bundle size analisado
  
- [ ] **Segurança**
  - [ ] Variáveis sensíveis em .env
  - [ ] Validação de inputs
  - [ ] HTTPS configurado
  - [ ] Headers de segurança
  
- [ ] **SEO & Acessibilidade**
  - [ ] Meta tags configuradas
  - [ ] robots.txt
  - [ ] sitemap.xml
  - [ ] ARIA labels
  
- [ ] **Testes**
  - [ ] Testes unitários passando
  - [ ] Testes de integração passando
  - [ ] Testado em diferentes browsers
  - [ ] Testado em mobile
  
- [ ] **Documentação**
  - [ ] README atualizado
  - [ ] CHANGELOG atualizado
  - [ ] Documentação de API (se houver)

### Otimizações de Performance

#### 1. Análise do Bundle

```bash
# Instalar analyzer
npm install -D rollup-plugin-visualizer

# Adicionar ao vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
});

# Executar build
npm run build
# Abre stats.html automaticamente
```

#### 2. Code Splitting

```typescript
// App.tsx
import { lazy, Suspense } from 'react';

// Lazy load de componentes
const DashboardView = lazy(() => import('./components/dashboard'));
const ClientesView = lazy(() => import('./components/clientes'));
const RHView = lazy(() => import('./components/rh'));

// Usar com Suspense
<Suspense fallback={<LoadingSpinner />}>
  {activeView === 'dashboard' && <DashboardView />}
  {activeView === 'clientes' && <ClientesView />}
  {activeView === 'rh' && <RHView />}
</Suspense>
```

#### 3. Otimização de Imagens

```bash
# Instalar sharp para otimização
npm install -D vite-plugin-image-optimizer

# vite.config.ts
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 }
    })
  ]
});
```

---

## 📦 Build de Produção

### Configuração do Build

```bash
# Build para produção
npm run build

# Output:
# dist/
#   ├── index.html
#   ├── assets/
#   │   ├── index-[hash].js
#   │   ├── index-[hash].css
#   │   └── [outros assets]
```

### Configuração Avançada (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Base URL (importante para deploy)
  base: '/',
  
  // Build options
  build: {
    outDir: 'dist',
    sourcemap: false, // true para debug
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendors
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          charts: ['recharts'],
          animations: ['motion/react']
        }
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/app/components'),
      '@ui': path.resolve(__dirname, './src/app/components/ui')
    }
  },
  
  // Preview server config
  preview: {
    port: 3000,
    host: true
  }
});
```

### Preview Local

```bash
# Build e preview
npm run build
npm run preview

# Acessar: http://localhost:3000
```

---

## ☁️ Deploy em Vercel

### Via CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy para produção
vercel --prod
```

### Via GitHub (Recomendado)

1. **Conectar Repositório**
   - Acesse https://vercel.com
   - Import Project → GitHub
   - Selecione o repositório

2. **Configurações**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Variáveis de Ambiente**
   - Settings → Environment Variables
   - Adicione as variáveis necessárias

4. **Deploy**
   - Cada push na branch `main` faz deploy automático
   - Preview deployments para PRs

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🌐 Deploy em Netlify

### Via CLI

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Inicializar
netlify init

# 4. Deploy
netlify deploy

# 5. Deploy para produção
netlify deploy --prod
```

### Via GitHub

1. **Conectar Repositório**
   - Acesse https://app.netlify.com
   - New site from Git → GitHub
   - Selecione repositório

2. **Configurações de Build**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Deploy**
   - Automático em cada push

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## ☁️ Deploy em AWS

### S3 + CloudFront

#### 1. Criar Bucket S3

```bash
# Via AWS CLI
aws s3 mb s3://itamoving-app
aws s3 website s3://itamoving-app \
  --index-document index.html \
  --error-document index.html
```

#### 2. Configurar Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::itamoving-app/*"
    }
  ]
}
```

#### 3. Build e Upload

```bash
# Build
npm run build

# Upload para S3
aws s3 sync dist/ s3://itamoving-app --delete

# Invalidar cache do CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

#### 4. Script de Deploy

Criar `deploy-aws.sh`:

```bash
#!/bin/bash

echo "🏗️  Building..."
npm run build

echo "📦 Uploading to S3..."
aws s3 sync dist/ s3://itamoving-app --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"

echo "✅ Deploy complete!"
```

```bash
# Tornar executável
chmod +x deploy-aws.sh

# Executar
./deploy-aws.sh
```

---

## 🐳 Deploy com Docker

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Prevent access to hidden files
        location ~ /\. {
            deny all;
        }
    }
}
```

### Docker Compose

```yaml
version: '3.8'

services:
  itamoving-app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Comandos Docker

```bash
# Build image
docker build -t itamoving-app .

# Run container
docker run -d -p 80:80 --name itamoving itamoving-app

# Using docker-compose
docker-compose up -d

# View logs
docker logs -f itamoving

# Stop container
docker stop itamoving

# Remove container
docker rm itamoving
```

---

## 🔐 Variáveis de Ambiente

### .env.example

```bash
# API Configuration
VITE_API_URL=https://api.itamoving.com
VITE_API_KEY=your_api_key_here

# Environment
VITE_APP_ENV=production

# Analytics
VITE_GA_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Features flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MONITORING=true
```

### Uso no Código

```typescript
// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  readonly VITE_GA_ID: string
  readonly VITE_SENTRY_DSN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Uso
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

---

## ⚙️ CI/CD com GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npx tsc --noEmit
      
      - name: Lint
        run: npm run lint
        continue-on-error: true
      
      - name: Run tests
        run: npm test
        continue-on-error: true
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_APP_ENV: production
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
  
  deploy-vercel:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
```

### Staging Environment

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install and Build
        run: |
          npm ci
          npm run build
        env:
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}
          VITE_APP_ENV: staging
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: develop
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📊 Monitoramento

### 1. Sentry (Error Tracking)

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

### 2. Google Analytics

```bash
npm install react-ga4
```

```typescript
// main.tsx
import ReactGA from 'react-ga4';

if (import.meta.env.PROD) {
  ReactGA.initialize(import.meta.env.VITE_GA_ID);
  
  // Track page views
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
}

// Em componentes
const trackEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label
  });
};
```

### 3. LogRocket (Session Replay)

```bash
npm install logrocket
```

```typescript
import LogRocket from 'logrocket';

if (import.meta.env.PROD) {
  LogRocket.init(import.meta.env.VITE_LOGROCKET_ID);
  
  // Identify user
  LogRocket.identify('user-id', {
    name: 'User Name',
    email: 'user@example.com'
  });
}
```

### 4. Web Vitals

```bash
npm install web-vitals
```

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Enviar para seu analytics
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 💾 Backup e Recuperação

### Estratégia de Backup

1. **Código Fonte**
   - Git (GitHub/GitLab)
   - Branches protegidas
   - Tags para releases

2. **Dados (Futuro - quando tiver backend)**
   - Backup automático diário do banco
   - Retention de 30 dias
   - Backup antes de deploys

3. **Assets**
   - S3 com versioning
   - CloudFront cache

### Plano de Recuperação

```bash
# 1. Rollback de Deploy (Vercel)
vercel rollback

# 2. Restaurar versão anterior (Git)
git checkout v1.0.0
git push origin main --force

# 3. Reverter para commit específico
git revert <commit-hash>
git push origin main
```

---

## 🔧 Manutenção

### Atualizações de Dependências

```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar patch versions
npm update

# Atualizar para latest
npx npm-check-updates -u
npm install

# Testar após atualização
npm test
npm run build
```

### Limpeza

```bash
# Limpar cache
npm cache clean --force

# Remover node_modules
rm -rf node_modules package-lock.json
npm install

# Limpar build
rm -rf dist
npm run build
```

### Health Checks

Criar endpoint `/health`:

```typescript
// public/health
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2024-12-30T00:00:00Z"
}
```

### Logs

```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, data);
    }
    // Enviar para serviço de logs em produção
  },
  
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // Enviar para Sentry
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

---

## 📈 Métricas de Produção

### Performance Targets

- **Time to First Byte (TTFB)**: < 200ms
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Uptime Monitoring

- **Target**: 99.9% uptime
- **Ferramentas**: UptimeRobot, Pingdom
- **Alertas**: Email, Slack, SMS

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Responsável**: Equipe DevOps ITAMOVING
