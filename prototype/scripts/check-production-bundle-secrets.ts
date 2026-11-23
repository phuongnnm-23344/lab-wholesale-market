// Downloads the JS chunks a deployed page loads and checks that no server-only secret ended up in them.
// Usage: APP_BASE_URL=https://<deploy> npm run check:bundle-secrets
// Prints only counts and chunk names, never the secret values themselves.

const base = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
if (!base) {
  console.error("APP_BASE_URL is required");
  process.exit(2);
}

const secretNames = ["SUPABASE_SECRET_KEY", "DEMO_ACCOUNT_PASSWORD", "TEST_ACCOUNT_PASSWORD", "DEMO_ACCOUNT_PIN"] as const;
const secrets = secretNames
  .map((name) => ({ name, value: process.env[name] ?? "" }))
  .filter((s) => s.value.length >= 4);
const missing = secretNames.filter((n) => !secrets.some((s) => s.name === n));

const pages = ["/login"];

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function chunkUrls(html: string): string[] {
  const found = new Set<string>();
  for (const m of html.matchAll(/["'(](\/_next\/static\/[^"'()\s]+?\.js)/g)) found.add(m[1]);
  return [...found];
}

async function main() {
  const chunks = new Set<string>();
  for (const page of pages) chunkUrls(await fetchText(base + page)).forEach((c) => chunks.add(c));
  if (chunks.size === 0) throw new Error("no /_next/static JS chunk found on the page");

  let hits = 0;
  let genericHits = 0;
  let bytes = 0;
  for (const chunk of chunks) {
    const body = await fetchText(base + chunk);
    bytes += body.length;
    for (const s of secrets) {
      if (body.includes(s.value)) {
        hits++;
        console.log(`LEAK ${s.name} in ${chunk}`);
      }
    }
    // supabase-js itself contains the bare literal "sb_secret_" (key-type check), so match a full key shape only.
    if (/sb_secret_[A-Za-z0-9_-]{16,}/.test(body)) {
      genericHits++;
      console.log(`LEAK sb_secret_<key> shape in ${chunk}`);
    }
  }

  console.log(`chunks scanned: ${chunks.size} (${Math.round(bytes / 1024)} KiB) from ${pages.join(", ")}`);
  console.log(`secret values checked: ${secrets.map((s) => s.name).join(", ")}`);
  if (missing.length) console.log(`not set locally (not checked): ${missing.join(", ")}`);
  console.log(`matches: secret values = ${hits}, sb_secret_<key> shape = ${genericHits}`);
  process.exit(hits + genericHits === 0 && secrets.length > 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("ERROR", e instanceof Error ? e.message : e);
  process.exit(2);
});
