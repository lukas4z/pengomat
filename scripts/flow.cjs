// Walks the participant flow in a real browser and saves screenshots to shots/.
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:3111";
const stil = process.argv[3] || "film";
const KEY = process.env.HOST_KEY || "test-key";
const hostHeaders = { "x-host-key": KEY, "content-type": "application/json" };
const log = (ok, msg) => console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);

(async () => {
  await fetch(`${base}/api/host/reset`, { method: "POST", headers: hostHeaders, body: JSON.stringify({ confirm: "PENG" }) });
  const b = await chromium.launch();
  const phone = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const p = await phone.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await p.goto(`${base}/?stil=${stil}`);
  await p.waitForSelector("#name");
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `shots/${stil}-1-start.png` });
  await p.locator(".card").scrollIntoViewIfNeeded();
  await p.locator(".card h2").tap();
  await p.waitForTimeout(420);
  await p.screenshot({ path: `shots/${stil}-2-schnee-rieselt.png` });

  await p.click("button[type=submit]");
  log((await p.locator(".field__error").count()) === 2, "empty form shows two errors and does not submit");

  await p.fill("#name", "Mia");
  await p.fill("#wish0", "Warme Socken");
  await p.click("text=+ noch ein Wunsch");
  await p.fill("#wish1", "Ein gutes Buch");
  await p.screenshot({ path: `shots/${stil}-2-formular.png` });
  await p.click("button[type=submit]");
  await p.waitForSelector("text=Du bist dabei, Mia!");
  await p.waitForTimeout(350);
  await p.screenshot({ path: `shots/${stil}-3-dabei-animation.png` });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `shots/${stil}-3-dabei.png` });
  log(true, "join shows the confirmation");

  await p.reload();
  await p.waitForSelector("text=Du bist dabei, Mia!");
  log(true, "reload keeps the confirmation");

  await p.click("text=Wünsche ändern");
  await p.fill("#edit0", "Sehr warme Socken");
  await p.click("text=Speichern");
  await p.waitForSelector("text=Sehr warme Socken");
  await p.reload();
  await p.waitForSelector("text=Du bist dabei, Mia!");
  log((await p.locator("text=Sehr warme Socken").count()) === 1, "edited wish persists after reload");

  // a second person (a child) on the same phone
  await p.click("text=+ Noch jemanden eintragen");
  await p.waitForSelector("text=Noch ein Wunschzettel");
  await p.fill("#name", "Ben");
  await p.fill("#wish0", "Lego");
  await p.click("button[type=submit]");
  await p.waitForSelector("text=Du bist dabei, Ben!");
  await p.reload();
  await p.waitForSelector(".people__chip");
  log((await p.locator(".people__chip").allInnerTexts()).join(",") === "Mia,Ben", "two people on one phone survive a reload");
  await p.screenshot({ path: `shots/${stil}-3-zwei-personen.png` });
  await p.locator(".people__chip", { hasText: "Mia" }).click();
  await p.waitForSelector("text=Du bist dabei, Mia!");
  log((await p.locator("text=Sehr warme Socken").count()) === 1 && (await p.locator("text=Lego").count()) === 0, "switching shows each person's own wishes");

  const link = await p.inputValue("#personal-link");
  const blocked = await b.newContext({ viewport: { width: 390, height: 844 } });
  await blocked.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error("blocked"); };
    Storage.prototype.getItem = () => { throw new Error("blocked"); };
  });
  const q = await blocked.newPage();
  await q.goto(link + `&stil=${stil}`);
  await q.waitForSelector("text=Du bist dabei, Mia!");
  log(!q.url().includes("t="), "personal link signs in without localStorage and hides the token");

  const other = await b.newContext({ viewport: { width: 390, height: 844 } });
  const r = await other.newPage();
  await r.goto(`${base}/?stil=${stil}`);
  await r.fill("#name", "mia");
  await r.fill("#wish0", "x");
  await r.click("button[type=submit]");
  await r.waitForSelector("text=Den Namen gibt's schon");
  log(true, "duplicate name is refused with a friendly message");

  // a link that is stale or belongs to someone else must not replace this device's own login
  await p.goto(`${base}/?t=kaputter-link&stil=${stil}`);
  await p.waitForSelector(".card h2");
  await p.waitForTimeout(800);
  log((await p.locator("text=Du bist dabei, Mia!").count()) === 1, "a stale link does not sign Mia out");
  const tina = await (await fetch(`${base}/api/join`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Tina", wishes: ["Tee"] }) })).json();
  await p.goto(`${base}/?t=${tina.token}&stil=${stil}`);
  await p.waitForSelector(".card h2");
  await p.waitForTimeout(800);
  log((await p.locator("text=Du bist dabei, Mia!").count()) === 1, "someone else's link does not turn Mia into them");
  const fresh = await b.newContext({ viewport: { width: 390, height: 844 } });
  const f = await fresh.newPage();
  await f.goto(`${base}/?t=kaputter-link&stil=${stil}`);
  await f.waitForSelector("#name");
  log((await f.locator("text=wurde entfernt").count()) === 0, "a stale link on a new device just shows the form");

  for (const [name, wish] of [["Oma Inge", "Selbstgebackene Plätzchen"], ["Jonas", "Kopfhörer"]])
    await fetch(`${base}/api/join`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, wishes: [wish] }) });
  const list = await (await fetch(`${base}/api/host/participants`, { headers: hostHeaders })).json();
  await fetch(`${base}/api/host/participants/${list.participants.find((x) => x.name === "Jonas").id}`, { method: "DELETE", headers: hostHeaders });
  await fetch(`${base}/api/join`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Opa Karl", wishes: ["Ein Schal"] }) });
  await fetch(`${base}/api/host/budget`, { method: "PUT", headers: hostHeaders, body: JSON.stringify({ budget: "15 €" }) });
  await fetch(`${base}/api/host/draw`, { method: "POST", headers: hostHeaders });

  await p.reload();
  await p.waitForSelector(".reveal__gift");
  await p.waitForTimeout(900);
  await p.screenshot({ path: `shots/${stil}-4-geschenk.png` });
  await p.locator(".reveal__gift").tap();
  await p.waitForTimeout(700);
  await p.locator(".reveal__gift").tap();
  await p.waitForTimeout(250);
  await p.screenshot({ path: `shots/${stil}-4-geschenk-schuetteln.png` });
  await p.waitForTimeout(500);
  log((await p.locator(".match__name").count()) === 0, "two shakes do not reveal");
  await p.locator(".reveal__gift").tap();
  await p.waitForSelector(".reveal__card .match__name");
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `shots/${stil}-5-enthuellt.png` });
  const name = await p.locator(".reveal__card .match__name").innerText();
  log(name !== "Mia" && name.length > 1, `three shakes reveal someone else (${name})`);
  await p.click("text=Alles klar!");
  await p.waitForTimeout(700);
  await p.locator(".people__chip", { hasText: "Ben" }).click();
  await p.waitForSelector(".reveal__gift");
  for (let i = 0; i < 3; i++) { await p.locator(".reveal__gift").tap(); await p.waitForTimeout(700); }
  await p.waitForSelector(".reveal__card .match__name");
  const benMatch = await p.locator(".reveal__card .match__name").innerText();
  log(benMatch !== "Ben" && benMatch !== name, `the second person gets their own present (${benMatch})`);
  await p.click("text=Alles klar!");
  await p.locator(".people__chip", { hasText: "Mia" }).click();
  await p.waitForTimeout(500);
  await p.reload();
  await p.waitForSelector(".card .match__name");
  log((await p.locator(".reveal").count()) === 0, "after reload the result shows directly");
  await p.locator(".card").scrollIntoViewIfNeeded();
  await p.screenshot({ path: `shots/${stil}-6-ergebnis.png` });

  const desk = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const d = await desk.newPage();
  await fetch(`${base}/api/host/reset`, { method: "POST", headers: hostHeaders, body: JSON.stringify({ confirm: "PENG" }) });
  await d.goto(`${base}/?stil=${stil}`);
  await d.waitForSelector("#name");
  await d.waitForTimeout(1200);
  await d.screenshot({ path: `shots/${stil}-desktop.png` });

  const real = errors.filter((e) => !e.includes("401")); // checking a stale link is an expected 401
  log(real.length === 0, `no unexpected console errors ${real.slice(0, 3).join(" | ")}`);
  await b.close();
})().catch((e) => { console.error("FAIL  script crashed:", e.message.split("\n")[0]); process.exit(1); });
