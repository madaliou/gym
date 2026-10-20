import { spawnSync } from "node:child_process";

function run(command) {
  const result = spawnSync(command, { stdio: "inherit", shell: true });

  if (result.status) {
    process.exit(result.status);
  }
}

run("prisma generate");

if (process.env.DATABASE_URL) {
  run("prisma migrate deploy");
} else {
  console.warn("DATABASE_URL is not set. Skipping prisma migrate deploy.");
}

run("next build");
