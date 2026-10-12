import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('customer → AI and staff → approval → receipt → verified device history', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/support?case=c1');
  await page.getByRole('button', { name: '已排查，仍未恢复' }).click();
  await page.getByLabel('选择图片证据').setInputFiles({ name: 'device-evidence.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5xkAAAAASUVORK5CYII=', 'base64') });
  await expect(page.getByRole('img', { name: '客户上传的设备故障证据' })).toBeVisible();
  await page.getByRole('button', { name: '申请真人协助' }).click();
  await page.getByRole('link', { name: '客服工作台', exact: true }).click();
  await page.getByRole('button', { name: '加入协作', exact: true }).click();
  await expect(page.getByText('客服林晓已加入。已有对话和排查记录已同步，无需重复描述。')).toBeVisible();
  await page.getByRole('button', { name: '采用草稿' }).click();
  await expect(page.getByRole('textbox', { name: '输入回复消息' })).toHaveValue(/知夏/);
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await page.getByRole('button', { name: '内部备注', exact: true }).click();
  await page.getByRole('textbox', { name: '输入内部备注' }).fill('内部信息：客户购买凭证待核验，不得向客户暴露内部审批细节。');
  await page.getByRole('button', { name: '保存备注' }).click();
  await page.getByRole('button', { name: '提出模拟换新' }).click();
  await page.getByRole('button', { name: '拒绝', exact: true }).click();
  await expect(page.getByRole('button', { name: '执行模拟换新' })).toHaveCount(0);
  await page.getByRole('button', { name: '提出模拟换新' }).click();
  await page.getByRole('button', { name: '批准方案' }).click();
  await expect(page.getByText('审批已通过，动作尚未执行。')).toBeVisible();
  await page.getByRole('button', { name: '执行模拟换新' }).click();
  await expect(page.getByText('模拟办理完成，等待客户核验。')).toBeVisible();
  await page.reload();
  await expect(page.getByText('模拟办理完成，等待客户核验。')).toBeVisible();
  await page.getByRole('link', { name: '进入用户视图核验' }).click();
  await expect(page.getByText('内部信息：客户购买凭证待核验，不得向客户暴露内部审批细节。')).toHaveCount(0);
  await page.getByRole('button', { name: '模拟确认已解决' }).click();
  await expect(page.getByText('服务已完成，感谢你的确认。')).toBeVisible();
  await page.getByRole('link', { name: '查看服务记录', exact: true }).click();
  await expect(page.getByText('模拟换新执行后，客户已确认问题解决；结果已归档。')).toBeVisible();
  await expect(page.getByText(/最新核验：/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('search, filters, keyboard dialog focus, and confirmed reset work', async ({ page }) => {
  await page.goto('/desk');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: '搜索工作空间' })).toBeVisible();
  await page.getByRole('textbox', { name: '搜索会话或设备' }).fill('许一川');
  await page.getByRole('link', { name: '异常发热', exact: false }).click();
  await expect(page).toHaveURL(/case=c4/);
  await expect(page.getByRole('heading', { name: '充电时出现异常发热', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '已解决', exact: true }).click();
  await expect(page.getByText('没有符合条件的会话')).toBeVisible();
  await page.getByRole('button', { name: '重置演示', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '重新开始这次演示？' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '重新开始这次演示？' })).not.toBeVisible();
  await page.getByRole('button', { name: '重置演示', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: '重置演示' }).click();
  await expect(page.getByText('演示已重置，可以重新体验完整流程')).toBeVisible();
});

test('all routes fit desktop, tablet, and phone; capture first UI review', async ({ page }) => {
  for (const [width, height] of [[1440, 1000], [1024, 850], [768, 1024], [390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const [route, label] of [['/desk', 'desktop'], ['/support', 'support'], ['/devices/demo-737', 'device']]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow, `${route} at ${width}px should not overflow`).toBe(false);
      if (width === 1440 || width === 390) await page.screenshot({ path: `../.impeccable/review/${width === 1440 ? label : `mobile-${label}`}.png`, fullPage: true });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/desk');
  await page.getByRole('button', { name: 'AI 协作', exact: true }).click();
  await page.getByRole('button', { name: '采用草稿' }).click();
  await expect(page.getByRole('textbox', { name: '输入回复消息' })).toHaveValue(/知夏/);
});

test('customer notification and search surfaces do not reveal internal or other-customer data', async ({ page }) => {
  await page.goto('/desk?case=c1');
  await page.getByRole('button', { name: '加入协作', exact: true }).click();
  await page.getByRole('button', { name: '提出模拟换新' }).click();
  await page.getByRole('button', { name: '批准方案' }).click();
  await page.goto('/support?case=c1');
  await page.getByRole('button', { name: '查看服务动态' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('客服批准模拟换新，尚未执行')).toHaveCount(0);
  await expect(dialog.getByText(/许一川|周予安|林嘉/)).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '搜索工作空间', exact: true }).click();
  await page.getByRole('textbox', { name: '搜索会话或设备' }).fill('许一川');
  await expect(page.getByRole('dialog').getByText('充电时出现异常发热')).toHaveCount(0);
});

test('a new safety report updates the staff summary and unconfirmed devices use a neutral illustration', async ({ page }) => {
  await page.goto('/support?case=c1');
  await page.getByRole('textbox', { name: '输入回复消息' }).fill('设备刚刚出现异常发热，还有异味。');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await page.goto('/desk?case=c1');
  await expect(page.locator('.diagnosis')).toContainText('安全异常');
  await expect(page.locator('.diagnosis')).not.toContainText('无明显安全异常');
  await page.goto('/support?case=c2');
  await expect(page.locator('.support-device img[src="/device-diagram.svg"]')).toHaveCount(0);
  await expect(page.locator('.support-device')).toContainText('设备身份待确认');
});

test('WCAG AA accessibility checks on each route at desktop and mobile', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/desk', '/support', '/devices/demo-737']) {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), `${route} at ${width}px`).toEqual([]);
    }
  }
});

test('safety summaries remain current while human controls public replies', async ({ page }) => {
  for (const mode of ['CO_SERVICE', 'HUMAN_LEAD']) {
    await page.goto('/desk?case=c1');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByLabel('当前协作模式').selectOption(mode);
    await page.goto('/support?case=c1');
    const aiBefore = await page.locator('.message.ai').count();
    await page.getByRole('textbox', { name: '输入回复消息' }).fill('设备现在出现异常发热，还有异味。');
    await page.getByRole('button', { name: '发送', exact: true }).click();
    await expect(page.locator('.message.ai')).toHaveCount(aiBefore);
    await page.goto('/desk?case=c1');
    await expect(page.locator('.diagnosis')).toContainText('安全异常，优先处理');
    await expect(page.locator('.reply-draft')).toContainText('请先停止使用');
    await page.screenshot({ path: `../.impeccable/review/safety-${mode}.png`, fullPage: true });
  }
});
