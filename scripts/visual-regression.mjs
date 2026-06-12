import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const port = Number(process.env.VISUAL_QA_PORT ?? 4177);
const baseUrl = `http://127.0.0.1:${port}`;
const outputDir = path.resolve("output/visual-regression");

function startServer() {
  const child = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let log = "";
  child.stdout.on("data", (chunk) => {
    log += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    log += chunk.toString();
  });

  return { child, getLog: () => log };
}

async function waitForServer(server) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 15_000) {
    if (server.child.exitCode !== null) {
      throw new Error(`Vite dev server exited early.\n${server.getLog()}`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until Vite is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${baseUrl}.\n${server.getLog()}`);
}

async function runViewport(browser, viewportName, viewport) {
  const page = await browser.newPage(viewport);
  const errors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console error: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    errors.push(`page error: ${error.message}`);
  });

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outputDir, `${viewportName}-start.png`), fullPage: true });

  await page.getByRole("button", { name: /press any key to start/i }).click();
  await page.screenshot({ path: path.join(outputDir, `${viewportName}-player.png`), fullPage: true });

  await page.getByRole("button", { name: /pomodoro timer/i }).click();
  await page.screenshot({ path: path.join(outputDir, `${viewportName}-timer.png`), fullPage: true });
  await page.getByRole("button", { name: /close timer/i }).click();

  await page.getByRole("button", { name: /about/i }).click();
  await page.screenshot({ path: path.join(outputDir, `${viewportName}-about.png`), fullPage: true });
  await page.getByRole("dialog", { name: /elvispresley\.cafe/i }).getByRole("button", { name: /^close$/i }).click();

  await page.getByRole("button", { name: /station catalog/i }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0));
  await page.screenshot({ path: path.join(outputDir, `${viewportName}-jukebox.png`), fullPage: true });

  const activeStation = await page.locator('button[aria-current="true"]').getAttribute("aria-label");
  const stationCount = await page.getByRole("listitem").count();
  const imageInfo = await page.locator("img").evaluateAll((images) =>
    images.map((image) => ({
      src: image.getAttribute("src"),
      complete: image.complete,
      width: image.naturalWidth,
      height: image.naturalHeight,
    })),
  );

  await page.close();

  for (const image of imageInfo) {
    if (!image.complete || image.width === 0 || image.height === 0) {
      errors.push(`Image failed to load: ${image.src}`);
    }
  }

  if (stationCount !== 5) {
    errors.push(`Expected 5 station cards, found ${stationCount}.`);
  }

  return { viewportName, activeStation, stationCount, imageInfo, errors };
}

await mkdir(outputDir, { recursive: true });

const server = startServer();
let browser;

try {
  await waitForServer(server);
  browser = await chromium.launch({ headless: true });

  const results = [
    await runViewport(browser, "desktop", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }),
    await runViewport(browser, "mobile", { viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 }),
  ];

  await writeFile(path.join(outputDir, "report.json"), `${JSON.stringify({ baseUrl, results }, null, 2)}\n`);

  const errors = results.flatMap((result) => result.errors.map((error) => `${result.viewportName}: ${error}`));
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  console.log(`Visual QA passed. Screenshots written to ${outputDir}`);
} finally {
  if (browser) {
    await browser.close();
  }

  server.child.kill("SIGTERM");
}
