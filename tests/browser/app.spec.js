import { test, expect } from '@playwright/test';

test('desktop registration, risk simulation, checklist and consultation', async ({ page }) => {
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:1200});
  await page.goto('/');
  await expect(page.locator('.connection')).toContainText('Flask 연결');
  await expect(page.locator('.phone')).toHaveCount(6);
  await page.getByLabel('양식 지역').selectOption('남해군');
  await page.getByRole('button',{name:'등록하기',exact:true}).click();
  await expect(page.locator('.temp-row')).toContainText('26.5');
  await expect(page.locator('.risk')).toContainText('관심');
  await page.getByLabel('테스트 수온').fill('30');
  await expect(page.locator('.risk')).toContainText('경계');
  await page.locator('.checklist input').first().check();
  await expect(page.locator('.checklist input').first()).toBeChecked();
  await page.getByRole('button',{name:'상담 신청하기',exact:true}).click();
  await expect(page.locator('.success-box')).toContainText('테스트가 완료');
  await page.getByRole('button',{name:'상품별 상세 내용 보기'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({path:'test-results/desktop.png',fullPage:true});
  await page.reload();
  await expect(page.getByLabel('양식 지역')).toHaveValue('남해군');
  expect(errors).toEqual([]);
});

test('mobile six-step flow has no horizontal overflow', async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('.step.active')).toHaveCount(1);
  await page.screenshot({path:'test-results/mobile-home.png',fullPage:true});
  await page.getByRole('button',{name:'시작하기',exact:true}).click();
  await expect(page.getByLabel('양식 지역')).toBeVisible();
  await page.getByRole('button',{name:'등록하기',exact:true}).click();
  await expect(page.locator('.step-2')).toBeVisible();
  await page.getByRole('button',{name:'맞춤 대응요령 확인'}).click();
  await page.locator('.checklist input').first().check();
  await page.locator('.mobile-pager').getByRole('button',{name:'다음'}).click();
  await page.getByRole('button',{name:'상담 신청하기',exact:true}).click();
  await expect(page.locator('.step-5')).toBeVisible();
  await page.getByRole('button',{name:/위험 알림 설정하기/}).click();
  await page.getByRole('dialog').getByRole('checkbox').check();
  await page.getByRole('button',{name:'확인',exact:true}).click();
  await expect(page.getByRole('button',{name:/위험 알림 설정하기/})).toContainText('켜짐');
  for(const width of [320,390,760,768,1024,1312,1440]){
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`).toBe(true);
  }
});

test('React remains usable when API is unavailable', async ({page})=>{
  await page.route('**/api/**',route=>route.abort());
  await page.goto('/');
  await expect(page.locator('.connection')).toContainText('로컬 예시');
  await page.getByRole('button',{name:'상담 신청하기',exact:true}).click();
  await expect(page.locator('.success-box')).toContainText('테스트가 완료');
  await expect(page.getByRole('status')).toContainText('실제 접수는 되지 않습니다');
});
