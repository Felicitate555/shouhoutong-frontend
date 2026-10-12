import { useEffect, useRef } from 'react';
import { Sparkles, Check, ClipboardCheck, ShieldCheck, ArrowUpRight, Image, FileCheck2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ServiceCase } from '../domain/types';
import { publicMessages } from '../domain/store';
import { useDemo, formatTime, formatDate } from '../domain/provider';
import { Avatar, Badge, Button, Icon } from './ui';

export function MessageThread({ serviceCase: c, customer = false }: { serviceCase: ServiceCase; customer?: boolean }) {
  const { dispatch } = useDemo();
  const ref = useRef<HTMLDivElement>(null);
  const lastCase = useRef(c.id);
  const messages = customer ? publicMessages(c) : c.messages;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const changed = lastCase.current !== c.id;
    if (changed) { el.scrollTop = 0; lastCase.current = c.id; }
    else if (messages.length > 5) el.scrollTop = el.scrollHeight;
  }, [messages.length, c.id]);
  return <div ref={ref} className="message-thread" role="log" aria-label={customer ? '公开服务对话' : '客户对话和内部记录'} aria-live="polite"><div className="thread-date">{formatDate(messages[0].time)}<span>服务记录</span></div>
    {messages.map(m => m.role === 'system' ? <div className="system-message" key={m.id}><Icon of={ShieldCheck} size={13} /><span>{m.text}</span></div> : <div key={m.id} className={`message ${m.role} ${m.visibility === 'internal' ? 'internal' : ''}`}>
      {m.role !== 'customer' && (m.role === 'ai' ? <span className="ai-avatar"><Icon of={Sparkles} size={17} /></span> : <Avatar name="晓" small />)}
      <div className="message-body"><div className="message-byline"><strong>{m.role === 'ai' ? '售后通 AI' : m.role === 'staff' ? '林晓' : c.customer}</strong>{m.role === 'ai' ? <Badge tone="cyan">AI 服务助手</Badge> : m.visibility === 'internal' ? <Badge tone="amber">内部备注</Badge> : m.role === 'staff' ? <span>客服专员</span> : null}<time>{formatTime(m.time)}</time></div>
        <div className="message-bubble"><p>{m.text}</p>{m.kind === 'check' && <div className="check-card"><div><Icon of={ClipboardCheck} size={17} /><strong>基础排查清单</strong><Badge tone={c.checked ? 'green' : 'neutral'}>{c.checked ? '已记录' : '待反馈'}</Badge></div><ul><li><Icon of={Check} size={13} />确认设备无明显安全异常</li><li><Icon of={Check} size={13} />更换完好且适配的连接线</li><li><Icon of={Check} size={13} />检查接口是否松动或有异物</li></ul>{customer ? <Button disabled={c.checked} icon={c.checked ? Check : ClipboardCheck} onClick={() => dispatch({ type: 'CHECK', caseId: c.id })}>{c.checked ? '排查结果已提交' : '已排查，仍未恢复'}</Button> : <Link to={`/support?case=${c.id}`} className="text-link">{c.checked ? '查看用户排查结果' : '在用户视图体验排查'}<Icon of={ArrowUpRight} size={13} /></Link>}</div>}
        {m.kind === 'receipt' && c.action?.receipt && <div className="receipt-card"><span><Icon of={FileCheck2} /><strong>模拟换新办理回执</strong><Badge tone="green">已执行</Badge></span><code>{c.action.receipt}</code><small>本地生成 · 未调用真实售后系统</small></div>}</div>
      </div>{m.role === 'customer' && <Avatar name={c.initials} color={c.color} small />}
    </div>)}
    {c.evidence.some(e => e.image) && <div className="attachment-preview"><Icon of={Image} size={14} /><span>客户附件 · 未核验</span><img src={c.evidence.find(e => e.image)!.image} alt="客户上传的设备故障证据" width="160" height="112" /></div>}
  </div>;
}
