import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  await page.goto('http://127.0.0.1:8501');
  const frame=await page.waitForEvent('framenavigated',{predicate:frame=>frame.url()==='http://127.0.0.1:5000/',timeout:30000}).catch(()=>page.frames().find(f=>f.url()==='http://127.0.0.1:5000/'));
  assert.ok(frame,'React iframe should load inside Streamlit');
  await frame.getByRole('button',{name:'등록하기',exact:true}).waitFor();
  assert.equal(await frame.locator('.phone').count(),6);
  await page.screenshot({path:'test-results/streamlit.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await frame.getByRole('button',{name:'시작하기',exact:true}).click();
  await frame.getByLabel('양식 지역').waitFor();
  assert.ok(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile iframe should fit viewport');
  console.log('Streamlit desktop and mobile embedded React: PASS');
} finally {await browser.close();}
