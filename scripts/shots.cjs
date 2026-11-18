const { chromium } = require("playwright");
(async () => {
const base = process.argv[2] || "http://localhost:3111";
const b = await chromium.launch();
for (const stil of ["sticker", "film"]) {
  for (const [name, w, h, dsf] of [["handy", 390, 844, 2], ["desktop", 1280, 800, 1]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf });
    const p = await ctx.newPage();
    for (const path of ["/", "/design"]) {
      await p.goto(`${base}${path}?stil=${stil}`);
      await p.waitForTimeout(1500);
      await p.screenshot({ path: `shots/${stil}-${name}-${path === "/" ? "start" : "design"}.png`, fullPage: true });
    }
    await ctx.close();
  }
}
await b.close();
})();
