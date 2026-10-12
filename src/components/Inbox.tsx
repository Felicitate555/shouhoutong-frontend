import { useState } from 'react';
import { Search, SlidersHorizontal, MessagesSquare, ChevronRight } from 'lucide-react';
import { useDemo, formatTime } from '../domain/provider';
import { useSearchParams } from 'react-router-dom';
import { stageNames } from './CaseHeader';
import { Avatar, Badge, Icon } from './ui';

export function Inbox({ selected, onSelect }: { selected: string; onSelect: () => void }) {
  const { state, dispatch } = useDemo();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const filter = params.get('filter') || 'all';
  const cases = state.cases.filter(c => `${c.customer} ${c.title} ${c.product}`.includes(query)).filter(c => filter === 'all' || (filter === 'pending' ? c.stage !== 'resolved' : c.stage === 'resolved'));
  return <section className="inbox panel" aria-label="服务收件箱"><div className="inbox-heading"><h2>服务收件箱 <span>{state.cases.length}</span></h2><Icon of={SlidersHorizontal} size={17} /></div>
    <label className="inbox-search"><Icon of={Search} size={16} /><input name="case-search" autoComplete="off" aria-label="搜索会话" placeholder="搜索会话…" value={query} onChange={e => setQuery(e.target.value)} /></label>
    <div className="inbox-tabs" aria-label="筛选会话">{[['all', '全部'], ['pending', '处理中'], ['resolved', '已解决']].map(([key, label]) => <button aria-pressed={filter === key} key={key} className={filter === key ? 'active' : ''} onClick={() => setParams(p => { p.set('filter', key); return p; })}>{label}</button>)}</div>
    <div className="case-list">{cases.length ? cases.map(c => <button key={c.id} className={`case-item ${selected === c.id ? 'selected' : ''}`} onClick={() => { setParams(p => { p.set('case', c.id); return p; }); dispatch({ type: 'READ', caseId: c.id }); onSelect(); }} aria-current={selected === c.id ? 'true' : undefined}>
      <span className="case-item-top"><Avatar name={c.initials} color={c.color} small /><strong>{c.customer}</strong><time>{formatTime(c.messages.at(-1)!.time)}</time>{c.unread && <span className="unread-dot" aria-label="未读" />}</span>
      <span className="case-item-title">{c.title}</span><span className="case-item-preview">{c.preview}</span><span className="case-item-bottom"><Badge tone={c.priority === 'high' ? 'red' : c.stage === 'resolved' ? 'green' : 'neutral'}>{c.priority === 'high' ? '安全优先' : stageNames[c.stage]}</Badge><span>{c.mode === 'AI_LEAD' ? 'AI 服务中' : '林晓 · 协作中'}</span></span>
    </button>) : <div className="empty-state"><Icon of={MessagesSquare} size={29} /><strong>没有符合条件的会话</strong><p>更换关键词或筛选条件。</p><button onClick={() => { setQuery(''); setParams(p => { p.set('filter', 'all'); return p; }); }}>显示全部会话 <Icon of={ChevronRight} size={14} /></button></div>}</div>
    <div className="inbox-footer"><span className="status-dot" />本地演示数据<span>4 个场景</span></div>
  </section>;
}
