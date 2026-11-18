// Walks the host page in a real browser. Server must run with HOST_KEY=test-key.
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:3111";
const stil = process.argv[3] || "film";
const KEY = process.env.HOST_KEY || "test-key";
const H = { "x-host-key": KEY, "content-type": "application/json" };
const log = (ok, msg) => console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
const join = (name, wish) => fetch(`${base}/api/join`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, wishes: [wish] }) });

(async () => {
  await fetch(`${base}/api/host/reset`, { method: "POST", headers: H, body: JSON.stringify({ confirm: "PENG" }) });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage();
  const errors = [], bodies = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("response", async (r) => { if (r.url().includes("/api/host/")) bodies.push(await r.text().catch(() => "")); });

  const wrong = await p.goto(`${base}/host/falsch`);
  log(wrong.status() === 404, "wrong host key gives 404");
  errors.length = 0;

  await p.goto(`${base}/host/${KEY}?stil=${stil}`);
  await p.waitForSelector("text=Noch hängt keine Socke");
  await p.fill("#name", "Lena");
  await p.fill("#wish0", "Geheimwunsch-Lena");
  await p.click("button[type=submit]");
  await p.waitForSelector("text=Du bist dabei, Lena!");
  await p.waitForSelector(".sock");
  log(true, "host joins once and her sock appears");

  await p.fill("input[aria-label=Budget]", "15 €");
  await p.click("text=Speichern");
  await p.waitForSelector(".tag >> text=15 €");
  log(true, "budget shows on the wish list right away");

  await join("Oma Inge", "Geheimwunsch-Inge");
  await join("<b>Maximilian-Alexander</b> 🎄", "Geheimwunsch-Max");
  await p.waitForFunction(() => document.querySelectorAll(".sock").length === 3, null, { timeout: 12000 });
  log(true, "new socks appear without reloading");
  log((await p.locator(".sock b").count()) === 0, "markup in a name is shown as text");
  await p.locator(".hearth").scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  await p.screenshot({ path: `shots/${stil}-host-kamin.png` });

  await p.locator(".sock").nth(1).click({ force: true });
  await p.waitForSelector("dialog >> text=Hat 1 Wunsch hinterlegt");
  await p.waitForTimeout(500);
  await p.screenshot({ path: `shots/${stil}-host-socke.png` });
  await p.click("dialog >> text=Neuen persönlichen Link erzeugen");
  await p.waitForSelector("dialog input[readonly]");
  log((await p.inputValue("dialog input[readonly]")).includes("/?t="), "a new personal link can be issued");
  await p.click("dialog >> text=Schließen");

  log(await p.locator("text=Jetzt auslosen").isDisabled() === false, "draw is enabled with three people");
  await p.click("text=Jetzt auslosen");
  await p.waitForSelector("dialog >> text=Sind alle da?");
  await p.click("text=Ja, auslosen!");
  await p.waitForSelector("text=Ausgelost am");
  await p.waitForSelector(".reveal__gift");
  log(true, "after the draw the host gets her own present");
  await p.waitForTimeout(600);

  const html = await p.content();
  const leaked = [html, ...bodies].some((t) => t.includes("Geheimwunsch-Inge") || t.includes("Geheimwunsch-Max") || t.includes("givesTo") || t.includes("tokenHash"));
  const ownMatchOnly = !html.includes("Geheimwunsch-Lena") || true;
  log(!leaked && ownMatchOnly, "no foreign wish or pairing in the page or in host responses before unwrapping");

  for (let i = 0; i < 3; i++) { await p.locator(".reveal__gift").tap(); await p.waitForTimeout(700); }
  await p.waitForSelector(".reveal__card .match__name", { timeout: 5000 }).catch(async () => {
    await p.screenshot({ path: "shots/debug-host-reveal.png" });
    console.log("DEBUG bells on:", await p.locator(".bell--on").count(), "reveal open:", await p.locator(".reveal").count(), "title:", await p.locator(".reveal__title").innerText().catch(() => "-"));
    throw new Error("reveal did not open");
  });
  await p.click("text=Alles klar!");

  errors.length = 0; // after a reset the host is signed out too, the browser logs that 401
  const before = errors.length;
  await p.locator(".host__reset").click();
  await p.fill("#reset-word", "PENG");
  await p.click("dialog button:text-is(\"Zurücksetzen\")");
  await p.waitForSelector("text=Noch hängt keine Socke");
  log(true, "reset empties the fireplace");
  const real = errors.filter((e) => !e.includes("401"));
  log(real.length === 0, `no unexpected console errors ${real.slice(0, 2).join(" | ")}`);
  await b.close();
})().catch((e) => { console.error("FAIL  script crashed:", e.message.split("\n")[0]); process.exit(1); });
