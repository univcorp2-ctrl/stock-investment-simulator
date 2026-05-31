import react from'@vitejs/plugin-react';import{defineConfig}from'vite';
export default defineConfig({base:process.env.GITHUB_PAGES==='true'?'/stock-investment-simulator/':'/',plugins:[react()],server:{proxy:{'/api':'http://localhost:3001'}}});
