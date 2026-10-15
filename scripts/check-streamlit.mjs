import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({channel:'msedge',headless:true});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [], forbiddenRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  // Cloud exposes only Streamlit: the UI must not depend on Flask or /api.
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.port === '5000' || url.pathname.startsWith('/api/')) forbiddenRequests.push(url.href);
  });
  await page.goto(process.env.STREAMLIT_URL || 'http://127.0.0.1:8501');
  const iframe = page.locator('iframe[title="app.ocean_care"]');
  await expect(iframe).toBeVisible({ timeout: 30000 });
  const frame = iframe.contentFrame();
  await expect(frame.locator('.phone')).toHaveCount(6);
  await expect(frame.locator('.connection')).toHaveText('예시 데이터');
  const imageUrl = await frame.locator('.sea-photo image').evaluate(el => new URL(el.getAttribute('href'), document.baseURI).href);
  const imageResponse = await page.request.get(imageUrl);
  assert.equal(imageResponse.status(), 200);
  assert.match(imageResponse.headers()['content-type'], /image\/png/);
  await frame.getByLabel('양식 지역').selectOption('남해군');
  await frame.getByRole('button', { name: '등록하기', exact: true }).click();
  await expect(frame.locator('.temp-row')).toContainText('26.5');
  await frame.getByLabel('테스트 수온').fill('30');
  await expect(frame.locator('.risk')).toContainText('경계');
  await frame.getByRole('button', { name: '상담 신청하기', exact: true }).click();
  await expect(frame.locator('.success-box')).toContainText('테스트가 완료');
  await expect(frame.getByRole('status')).toContainText('실제 기관에 전송되지 않습니다');
  await page.screenshot({ path: 'test-results/streamlit.png', fullPage: true });
  await page.reload();
  await expect(frame.getByLabel('양식 지역')).toHaveValue('남해군');
  await page.setViewportSize({ width: 390, height: 844 });
  await frame.getByRole('button', { name: '시작하기', exact: true }).click();
  await expect(frame.getByLabel('양식 지역')).toBeVisible();
  for (const width of [320, 390, 760, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => frame.locator('body').evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect.poll(async () => {
      const bodyHeight = await frame.locator('body').evaluate(el => Math.ceil(el.getBoundingClientRect().height));
      const frameHeight = await iframe.evaluate(el => el.clientHeight);
      return Math.abs(bodyHeight - frameHeight);
    }).toBeLessThanOrEqual(1);
  }
  assert.deepEqual(forbiddenRequests, []);
  assert.deepEqual(errors, []);
  console.log('Streamlit assets, registration, consultation, persistence and responsive layout: PASS');
} finally {await browser.close();}
