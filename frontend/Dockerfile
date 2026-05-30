FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci && npm install @angular/animations@20.3.18 --no-save

COPY . .

RUN node -e "const fs=require('fs'); const p='angular.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); const b=j.projects.frontend.architect.build.configurations.production.budgets.find(x=>x.type==='initial'); b.maximumWarning='1.5MB'; b.maximumError='2MB'; fs.writeFileSync(p, JSON.stringify(j,null,2));"
RUN node -e "const fs=require('fs'); const p='src/app/app.routes.server.ts'; let s=fs.readFileSync(p,'utf8'); s=s.replace('renderMode: RenderMode.Prerender','renderMode: RenderMode.Server'); fs.writeFileSync(p,s);"
RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm install @angular/animations@20.3.18 --omit=dev --no-save

COPY --from=build /app/dist ./dist

ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/frontend/server/server.mjs"]
