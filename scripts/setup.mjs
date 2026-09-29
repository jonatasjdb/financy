// Prepara o projeto para rodar localmente: cria os .env a partir dos .env.example,
// instala dependências, aplica as migrations e popula o banco com dados de demonstração.
import { copyFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const run = (cmd, cwd) => {
  console.log(`\n▶ ${cmd}  (${cwd})`);
  execSync(cmd, { cwd, stdio: "inherit" });
};

for (const dir of ["backend", "frontend"]) {
  if (!existsSync(`${dir}/.env`)) {
    copyFileSync(`${dir}/.env.example`, `${dir}/.env`);
    console.log(`✔ ${dir}/.env criado a partir de ${dir}/.env.example`);
  }
}

run("npm install", "backend");
run("npm run setup", "backend");
run("npm install", "frontend");

console.log("\n✅ Tudo pronto! Rode `npm run dev` na raiz do projeto.");
