import type { Action, DemoState, Message, ServiceCase } from './types';
import { createSeed } from './seed';

const id = () => crypto.randomUUID();
function note(c: ServiceCase, text: string): ServiceCase {
  return { ...c, activity: [...c.activity, { id: id(), text, time: new Date().toISOString() }] };
}
function message(c: ServiceCase, role: Message['role'], text: string, visibility: Message['visibility'] = 'public', kind?: Message['kind']): ServiceCase {
  return { ...c, messages: [...c.messages, { id: id(), role, text, visibility, kind, time: new Date().toISOString() }] };
}

export function reducer(state: DemoState, action: Action): DemoState {
  if (action.type === 'RESET') return createSeed();
  const current = state.cases.find(c => c.id === action.caseId);
  if (!current) return state;
  let c = current;
  switch (action.type) {
    case 'READ': c = { ...c, unread: false }; break;
    case 'MESSAGE': {
      const text = action.text.trim().slice(0, 4000);
      if (!text || (action.role === 'ai' && action.visibility === 'public' && c.mode !== 'AI_LEAD')) return state;
      if (action.role === 'customer' && action.visibility !== 'public') return state;
      c = message(c, action.role, text, action.visibility);
      if (action.visibility === 'public') c = { ...c, preview: text };
      if (action.role === 'customer' && c.mode === 'AI_LEAD') {
        c = message(c, 'ai', containsSafetyReport(text)
          ? '请先停止使用，安全断开电源，不要继续充电或拆机。建议由真人客服协助确认后续处理。此回复来自本地演示规则。'
          : '已记录你的补充信息。你可以完成基础排查，或请真人客服加入协作。这是本地脚本演示，不是模型实时生成的诊断。');
      }
      if (action.role === 'customer' && c.stage === 'resolved') c = note({ ...c, stage: 'collaborating', mode: 'CO_SERVICE' }, '客户补充问题，重新开启服务');
      break;
    }
    case 'JOIN':
      if (c.mode === 'CO_SERVICE' || c.stage === 'resolved') return state;
      c = note({ ...c, mode: 'CO_SERVICE', stage: c.stage === 'diagnosing' ? 'collaborating' : c.stage }, '林晓加入协作，AI 继续整理证据与起草回复');
      c = message(c, 'system', '客服林晓已加入。已有对话和排查记录已同步，无需重复描述。');
      c = message(c, 'staff', '你好，我是林晓。我已看过你的描述和排查记录，接下来会与你一起确认处理方案。');
      break;
    case 'MODE':
      if (c.mode === action.mode) return state;
      c = note({ ...c, mode: action.mode }, `协作模式切换为${action.mode === 'AI_LEAD' ? 'AI 主导' : action.mode === 'CO_SERVICE' ? '共同服务' : '真人主导'}`);
      c = message(c, 'system', action.mode === 'AI_LEAD' ? 'AI 继续为你服务，必要时可随时申请真人协助。' : action.mode === 'CO_SERVICE' ? 'AI 与真人共同服务，公开回复由客服审核。' : '真人客服主导服务，AI 继续提供内部协助。');
      break;
    case 'CHECK':
      if (c.checked) return state;
      c = note({ ...c, checked: true }, '客户完成基础排查：仍未恢复充电');
      c = { ...c, evidence: [...c.evidence, { id: id(), title: '基础排查未解决', detail: '更换连接方式后，仍未恢复', source: '客户排查反馈', verified: false }] };
      c = message(c, 'customer', '已完成基础排查，设备仍然无法充电。');
      if (c.mode === 'AI_LEAD') c = message(c, 'ai', '已保存排查结果。建议请真人客服一起核对售后条件，已有信息会同步给客服。');
      break;
    case 'REQUEST_HUMAN':
      if (c.requestedHuman || c.mode !== 'AI_LEAD') return state;
      c = note({ ...c, requestedHuman: true }, '客户申请真人协作');
      c = message(c, 'system', '已提交真人协助请求。演示中可切换到客服工作台，点击“加入协作”。');
      break;
    case 'PROPOSE':
      if (c.mode === 'AI_LEAD' || c.stage !== 'collaborating' || c.action?.status === 'SUCCEEDED') return state;
      c = note({ ...c, stage: 'approval', action: { status: 'WAITING_APPROVAL' } }, '提出模拟换新方案，等待客服审批');
      break;
    case 'APPROVE':
      if (c.action?.status !== 'WAITING_APPROVAL') return state;
      c = note({ ...c, stage: 'approved', action: { status: 'APPROVED' } }, '客服批准模拟换新，尚未执行');
      break;
    case 'REJECT':
      if (c.action?.status !== 'WAITING_APPROVAL') return state;
      c = note({ ...c, stage: 'collaborating', action: { status: 'REJECTED' } }, '客服拒绝模拟方案，继续收集信息');
      break;
    case 'EXECUTE':
      if (c.action?.status !== 'APPROVED') return state;
      c = note({ ...c, stage: 'verification', action: { status: 'SUCCEEDED', receipt: `DEMO-${c.number.slice(-3)}-${id().slice(0, 6).toUpperCase()}` } }, '本地模拟换新已执行，生成演示回执，等待客户核验');
      c = message(c, 'staff', '模拟换新申请已完成，回执已生成。此演示没有调用实际售后系统，也不会发货。你可以在下方模拟确认处理结果。', 'public', 'receipt');
      break;
    case 'VERIFY':
      if (c.stage !== 'verification') return state;
      c = note({ ...c, stage: action.solved ? 'resolved' : 'collaborating' }, action.solved ? '客户核验已解决，服务结果归档' : '客户核验未解决，继续服务');
      c = message(c, 'customer', action.solved ? '模拟确认：问题已解决，感谢你们的帮助。' : '模拟确认：问题还没有解决，希望继续处理。');
      c = message(c, 'system', action.solved ? '本次服务已完成。核验结果已关联到设备服务记录。' : '服务问题已重新开启，原有证据和回执仍保留。');
      break;
    case 'ATTACH':
      if (!/^data:image\/(png|jpeg|webp);base64,/.test(action.image) || action.image.length > 2_900_000) return state;
      c = { ...c, evidence: [...c.evidence.filter(e => !e.image), { id: id(), title: action.filename.slice(0, 80), detail: '客户上传图片，尚未经核验', source: '客户附件', verified: false, image: action.image }] };
      c = message(c, 'customer', `已上传图片：${action.filename.slice(0, 80)}。请结合图片继续排查。`);
      c = note(c, '客户上传新的图片证据');
      break;
  }
  if (c === current) return state;
  return { ...state, cases: state.cases.map(item => item.id === c.id ? c : item) };
}

export function publicMessages(serviceCase: ServiceCase) { return serviceCase.messages.filter(m => m.visibility === 'public'); }

function containsSafetyReport(text: string): boolean {
  const positiveText = text.replace(/(?:没有(?:出现)?|无|未出现|未发现|不存在|不再|不)(?:明显|异常|任何)?(?:发热|过热|鼓包|异味|冒烟)(?:(?:、|和|或|及)(?:发热|过热|鼓包|异味|冒烟))*/g, '');
  return /发热|过热|鼓包|异味|冒烟|烫手|很烫/.test(positiveText);
}
export function hasSafetyAlert(serviceCase: ServiceCase): boolean {
  return serviceCase.priority === 'high' || serviceCase.messages.some(m => m.role === 'customer' && m.visibility === 'public' && containsSafetyReport(m.text));
}
