import { ArrowUpRight, Check, Circle, Users, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ServiceCase } from '../domain/types';
import { Badge, Icon } from './ui';

export const stageNames = { diagnosing: '排查中', collaborating: '共同处理中', approval: '等待审批', approved: '等待执行', verification: '等待核验', resolved: '已解决' };
export const modeNames = { AI_LEAD: 'AI 主导', CO_SERVICE: '共同服务', HUMAN_LEAD: '真人主导' };
export function Journey({ serviceCase: c }: { serviceCase: ServiceCase }) {
  const current = c.stage === 'diagnosing' ? 1 : c.stage === 'collaborating' ? 2 : ['approval', 'approved'].includes(c.stage) ? 3 : c.stage === 'verification' ? 4 : 5;
  return <ol className="journey" aria-label="服务处理阶段">{['问题受理', '智能排查', '真人协作', '售后办理', '结果核验'].map((name, i) => <li key={name} className={i < current ? 'done' : i === current ? 'current' : ''}><span className="journey-icon">{i < current ? <Icon of={Check} size={12} /> : i === current ? <span /> : <Icon of={Circle} size={7} />}</span><span>{name}</span></li>)}</ol>;
}
export function CaseHeader({ serviceCase: c }: { serviceCase: ServiceCase }) {
  return <div className="case-header"><div className="case-title-row"><div><h2>{c.title}</h2><div className="case-meta"><span translate="no">{c.number}</span><span className="meta-separator" /><span>{c.product}</span></div></div><Badge tone={c.stage === 'resolved' ? 'green' : c.stage === 'approval' ? 'amber' : 'cyan'}>{stageNames[c.stage]}</Badge></div><div className="case-associations"><span><Icon of={Users} size={14} />{c.customer}</span>{c.deviceId ? <Link to={`/devices/${c.deviceId}`}><Icon of={Fingerprint} size={14} />设备已关联<Icon of={ArrowUpRight} size={12} /></Link> : <span>设备身份待确认</span>}<Badge>演示案例</Badge></div><Journey serviceCase={c} /></div>;
}
