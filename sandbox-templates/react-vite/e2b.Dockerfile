# Use latest supported Node for Vite + Tailwind 4
FROM node:22-slim

RUN apt-get update && apt-get install -y curl git && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# ---------------------------------------
# CREATE VITE + REACT + TYPESCRIPT APP
# ---------------------------------------
WORKDIR /home/user/vite-app
RUN npx --yes create-vite@latest . --template react-ts

RUN npm install && npm install -D @types/node

# ---------------------------------------
# INSTALL TAILWIND v4 + VITE PLUGIN
# ---------------------------------------
RUN npm install tailwindcss @tailwindcss/vite

RUN echo '@import "tailwindcss";' > src/index.css

# ---------------------------------------
# REPLACE tsconfig.app.json WITH VALID JSON
# (no comments! required for JSON.parse)
# ---------------------------------------
RUN echo '\
  {\
  "compilerOptions": {\
  "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",\
  "target": "ES2022",\
  "useDefineForClassFields": true,\
  "lib": ["ES2022", "DOM", "DOM.Iterable"],\
  "module": "ESNext",\
  "types": ["vite/client"],\
  "skipLibCheck": true,\
  "moduleResolution": "bundler",\
  "allowImportingTsExtensions": true,\
  "verbatimModuleSyntax": true,\
  "moduleDetection": "force",\
  "noEmit": true,\
  "jsx": "react-jsx",\
  "strict": true,\
  "noUnusedLocals": true,\
  "noUnusedParameters": true,\
  "erasableSyntaxOnly": true,\
  "noFallthroughCasesInSwitch": true,\
  "noUncheckedSideEffectImports": true,\
  "baseUrl": ".",\
  "paths": { "@/*": ["src/*"] }\
  },\
  "include": ["src"]\
  }' > tsconfig.app.json

# ---------------------------------------
# PATCH tsconfig.json ALIAS (this one is valid JSON)
# ---------------------------------------
RUN node -e "\
  const fs = require('fs');\
  const file = 'tsconfig.json';\
  let config = JSON.parse(fs.readFileSync(file, 'utf8'));\
  if (!config.compilerOptions) config.compilerOptions = {};\
  config.compilerOptions.baseUrl = '.';\
  config.compilerOptions.paths = { '@/*': ['./src/*'] };\
  fs.writeFileSync(file, JSON.stringify(config, null, 2));\
  console.log('Updated tsconfig.json');\
  "

# ---------------------------------------
# SHADCN + REQUIRED DEPS
# ---------------------------------------
RUN npm install class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot

RUN npx shadcn@canary init -y -b neutral --css-variables
RUN npx shadcn@canary add -a -y

# ---------------------------------------
# VITE CONFIG FOR E2B
# ---------------------------------------
RUN echo '\
  import { defineConfig } from "vite";\
  import react from "@vitejs/plugin-react";\
  import tailwindcss from "@tailwindcss/vite";\
  import path from "path";\
  \
  export default defineConfig({\
  plugins: [react(), tailwindcss()],\
  resolve: {\
  alias: { "@": path.resolve(__dirname, "./src") },\
  },\
  server: {\
  host: "0.0.0.0",\
  port: 5173,\
  allowedHosts: [".e2b.app"],\
  strictPort: true,\
  hmr: { protocol: "wss", host: "e2b.app", clientPort: 443 }\
  }\
  });\
  ' > vite.config.ts

# ---------------------------------------
# MOVE PROJECT OUT OF vite-app
# ---------------------------------------
RUN mv /home/user/vite-app/* /home/user/ && rm -rf /home/user/vite-app
WORKDIR /home/user

RUN rm -f postcss.config.js tailwind.config.js || true
RUN rm -rf node_modules/.vite node_modules/.cache .tsbuildinfo || true
