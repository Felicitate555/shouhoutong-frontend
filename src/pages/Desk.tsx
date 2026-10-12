import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Users, Sparkles, ShieldCheck, ChevronRight, MessagesSquare } from 'lucide-react';
import { useDemo } from '../domain/provider';
import { Badge, Icon } from '../components/ui';
import { CaseHeader, modeNames } from '../components/CaseHeader';
import { Inbox } from '../components/Inbox';
import { MessageThread } from '../components/MessageThread';
import { Composer } from '../components/Composer';
import { Copilot } from '../components/Copilot';

export function Desk() {
  const { state } = useDemo();
  const [params] = useSearchParams();
  const c = state.cases.find(item => item.id === params.get('case')) ?? state.cases[0];
  const [draft, setDraft] = useState('');
  const [mobileTab, setMobileTab] = useState('conversation');
  const active = state.cases.filter(item => item.stage !== 'resolved').length;
  const collaboration = state.cases.filter(item => item.mode !== 'AI_LEAD' && item.stage !== 'resolved').length;
  return <div className="desk-page"><div className="page-heading"><div><h1>服务工作台<span className="heading-dot" /></h1><p>让每一次协作，都接近问题的解决。</p></div><Link className="button secondary" to={`/support?case=${c.id}`}>打开用户视图 <Icon of={ArrowUpRight} size={15} /></Link></div>
    <div className="desk-overview"><div><span><Icon of={MessagesSquare} size={16} />正在处理</span><strong>{active}<small>个服务问题</small></strong></div><div><span><Icon of={Users} size={16} />人机协作</span><strong>{collaboration}<small>个协作会话</small></strong></div><div><span><Icon of={ShieldCheck} size={16} />待审批</span><strong>{state.cases.filter(item => item.stage === 'approval').length}<small>项售后动作</small></strong></div><Link to={`/devices/demo-737`} className="overview-link"><span className="overview-spark"><Icon of={Sparkles} size={19} /></span><span><strong>服务有记录，协作有延续</strong><small>设备档案连接每一次售后</small></span><Icon of={ChevronRight} size={17} /></Link></div>
    <div className="mobile-workspace-tabs"><button aria-pressed={mobileTab === 'inbox'} className={mobileTab === 'inbox' ? 'active' : ''} onClick={() => setMobileTab('inbox')}>收件箱</button><button aria-pressed={mobileTab === 'conversation'} className={mobileTab === 'conversation' ? 'active' : ''} onClick={() => setMobileTab('conversation')}>对话</button><button aria-pressed={mobileTab === 'assist'} className={mobileTab === 'assist' ? 'active' : ''} onClick={() => setMobileTab('assist')}>AI 协作</button></div>
    <div className={`desk-grid mobile-${mobileTab}`}><Inbox selected={c.id} onSelect={() => setMobileTab('conversation')} /><section className="conversation panel" aria-label="当前服务对话"><CaseHeader serviceCase={c} /><div className="conversation-toolbar"><span><Icon of={MessagesSquare} size={14} />服务对话</span><div><span className="status-dot" /><span>{modeNames[c.mode]}</span><Badge>{c.mode === 'AI_LEAD' ? 'AI 回复' : '真人审核'}</Badge></div></div><MessageThread serviceCase={c} /><Composer key={c.id} serviceCase={c} draft={draft} onDraftUsed={() => setDraft('')} /></section><Copilot serviceCase={c} onDraft={value => { setDraft(value); setMobileTab('conversation'); }} /></div>
    <footer className="page-footer"><span><Icon of={ShieldCheck} size={12} />受控动作 · 可核验结果 · 持续服务记录</span><span>本地交互演示，未接入真实售后系统</span></footer>
  </div>;
}
