import type { DemoState, Message, ServiceCase } from './types';

export function createSeed(): DemoState {
  const at = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
  const m = (id: string, role: Message['role'], text: string, minutes: number, kind?: Message['kind']): Message => ({ id, role, text, time: at(minutes), kind, visibility: 'public' });
  const first: ServiceCase = {
    id: 'c1', number: 'ST-20261013-001', customer: '陈知夏', initials: '夏', color: 'mint', product: 'Anker 737 充电宝', title: '充电宝无法充电',
    preview: '换了两条线，还是充不进去电。', priority: 'normal', deviceId: 'demo-737', mode: 'AI_LEAD', stage: 'diagnosing', unread: true, checked: false, requestedHuman: false,
    messages: [
      m('m1', 'system', '服务已建立。已关联您授权的设备档案。', 12),
      m('m2', 'customer', '你好，我的充电宝突然充不进去电了，屏幕一直显示 0%。换了两条线也没有反应。', 11),
      m('m3', 'ai', '你好，知夏，我会陪你一起排查。先确认安全：设备是否有异常发热、鼓包、异味，或接口破损？如有，请停止使用，不要继续充电。', 10),
      m('m4', 'customer', '没有发热和鼓包，接口看起来也正常。买了大概半年，昨天之前还能用。', 8),
      m('m5', 'ai', '收到。设备档案和你描述的情况已整理好。请完成下面的基础排查，我会记录结果；如果仍无法充电，可以请真人客服一起确认后续方案。', 7, 'check'),
    ],
    evidence: [
      { id: 'e1', title: '设备身份已确认', detail: '演示序列号 · A737••••0421', source: '设备档案', verified: true },
      { id: 'e2', title: '无明显安全异常', detail: '无发热、鼓包或接口破损', source: '客户描述', verified: false },
      { id: 'e3', title: '已更换两条充电线', detail: '两次尝试均未恢复充电', source: '当前对话', verified: false },
    ],
    activity: [{ id: 'a1', text: '用户报障，建立独立服务问题', time: at(12) }, { id: 'a2', text: 'AI 整理设备档案与客户描述', time: at(7) }],
  };
  const other = (id: string, customer: string, initials: string, color: string, product: string, title: string, text: string, minutes: number, priority: ServiceCase['priority'] = 'normal'): ServiceCase => ({
    id, number: `ST-20261013-00${id.slice(1)}`, customer, initials, color, product, title, preview: text, priority, mode: 'AI_LEAD', stage: 'diagnosing', unread: false, checked: false, requestedHuman: false,
    messages: [m(`${id}-1`, 'customer', text, minutes), m(`${id}-2`, 'ai', priority === 'high' ? '请先停止使用并断开电源。如有鼓包、异味或异常发热，不要继续测试。我已整理安全提示，可以请真人客服协助处理。' : '已收到你的问题。先确认设备型号和发生问题的场景，再根据你的反馈进行排查。以下内容为前端演示。', minutes - 1)],
    evidence: [{ id: `${id}-e`, title: '客户报障描述', detail: text, source: '当前对话', verified: false }],
    activity: [{ id: `${id}-a`, text: '用户报障，等待进一步排查', time: at(minutes) }],
  });
  return { version: 1, cases: [first,
    other('c2', '周予安', '安', 'lavender', 'soundcore 耳机', '左耳声音明显偏小', '左耳声音比右耳小很多，重连后还是一样。', 24),
    other('c3', '林嘉', '嘉', 'sand', 'eufy 扫地机器人', '设备无法返回充电座', '扫完之后找不到充电座，需要手动搬回去。', 43),
    other('c4', '许一川', '川', 'rose', 'Anker 充电器', '充电时出现异常发热', '充电器比之前烫很多，还闻到了异味。', 61, 'high'),
  ] };
}
