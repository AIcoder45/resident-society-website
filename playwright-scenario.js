/* eslint-disable no-console */
// Basic Playwright scenario used by Artillery's Playwright engine.
// Each virtual user (VU) will execute this script in a real (headless) browser.

const { chromium } = require("playwright");

module.exports = async function playwrightScenario() {
  const vuId = process.env.ARTILLERY_VU || "unknown-vu";
  const iteration = process.env.ARTILLERY_ITERATION || "1";

  const target = process.env.ARTILLERY_TARGET || "http://localhost:3000";
  const startTime = Date.now();

  console.log(
    `[playwright][start] vu=${vuId} iteration=${iteration} target=${target}`,
  );

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: {
        width: 1280,
        height: 720,
      },
    });

    const page = await context.newPage();

    // 1. Hit the homepage and wait for it to settle
    await page.goto(target, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // 2. Navigate to the contact page (one of the more interactive flows)
    await page.goto(`${target}/contact`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // 3. Optionally, exercise the contact form lightly to simulate real usage
    try {
      await page.fill('input[name="name"]', "Performance Test User");
      await page.fill('input[name="email"]', "perf-test@example.com");
      await page.fill('input[name="subject"]', "Load test message");
      await page.fill(
        'textarea[name="message"]',
        "This is a synthetic performance test message.",
      );
      // Do not actually submit to avoid spamming email in real environments.
    } catch (formError) {
      console.warn(
        `[playwright][warn] vu=${vuId} iteration=${iteration} contact form selectors not found`,
      );
    }

    const durationMs = Date.now() - startTime;
    console.log(
      `[playwright][end] vu=${vuId} iteration=${iteration} duration_ms=${durationMs}`,
    );

    await context.close();
  } catch (error) {
    console.error(
      `[playwright][error] vu=${vuId} iteration=${iteration}`,
      error,
    );
    throw error;
  } finally {
    await browser.close();
  }
};




