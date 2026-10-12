import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Fingerprint, ShieldCheck, ArrowUpRight, ChevronRight, CheckCircle2, FileText, Clock3, Link2, BatteryCharging, Search, LockKeyhole, History, CircleCheck } from 'lucide-react';
import { useDemo, formatDate, formatTime } from '../domain/provider';
import { Badge, Button, Icon } from '../components/ui';
import { stageNames } from '../components/CaseHeader';

export function Device() {
  const { state, toast } = useDemo();
  const { id } = useParams();
  const [tab, setTab] = useState('overview');
  const [query, setQuery] = useState('');
  const c = state.cases[0];
  if (id !== 'demo-737') return <div className="not-found"><Icon of={Fingerprint} size={42} /><h1>没有找到这台设备</h1><p>演示只包含一份已确认的设备档案。</p><Link className="button primary" to="/devices/demo-737">查看演示设备</Link></div>;
  const history = [
    { id: c.id, title: c.title, date: '2026 年 10 月 13 日', status: stageNames[c.stage], description: c.stage === 'resolved' ? '模拟换新执行后，客户已确认问题解决；结果已归档。' : c.stage === 'verification' ? '模拟换新办理完成，回执已保存，等待客户确认结果。' : '对话、排查证据与人机协作记录持续保存，等待处理结果。', current: true },
    { id: 'h1', title: '充电速度与使用场景咨询', date: '2026 年 6 月 2 日', status: '已解决', description: '演示历史：核对使用场景后，客户确认设备可以正常使用。未办理换新。', current: false },
    { id: 'h2', title: '首次使用与设备登记', date: '2026 年 4 月 13 日', status: '已完成', description: '演示历史：确认设备身份，保存授权资料与设备登记记录。', current: false },
  ].filter(row => `${row.title} ${row.description}`.includes(query));
  return <div className="device-page"><div className="page-heading"><div><div className="device-breadcrumb"><Link to="/desk">服务工作台</Link><Icon of={ChevronRight} size={13} /><span>设备档案</span></div><h1>一台设备，一份持续的服务档案。</h1><p>记录已确认的事实，也记录每一次解决问题的过程。</p></div><Badge>演示设备资料</Badge></div>
    <section className="passport panel"><div className="passport-art"><img src="/device-diagram.svg" alt="充电宝设备示意图，并非官方产品图片" width="180" height="220" /><span>设备示意图</span></div><div className="passport-information"><h2>Anker 737 充电宝 <Badge tone="green">身份已确认</Badge></h2><p>陈知夏的设备 · 演示序列号 <span translate="no">A737••••0421</span></p><div className="passport-facts"><div><span>档案建立</span><strong>2026 年 4 月 13 日</strong></div><div><span>服务记录</span><strong>3 次</strong></div><div><span>当前服务状态</span><strong>{stageNames[c.stage]}</strong></div></div></div><div className="passport-actions"><Link className="button primary" to={`/desk?case=${c.id}`}><Icon of={MessagesIcon} size={16} />查看当前服务<Icon of={ArrowUpRight} size={14} /></Link><Button icon={Link2} onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); toast('设备档案链接已复制'); } catch { toast('浏览器未允许复制，请从地址栏复制链接'); } }}>复制档案链接</Button><span><Icon of={LockKeyhole} size={12} />仅展示已授权的相关信息</span></div></section>
    <div className="device-tabs" aria-label="设备档案视图"><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')} aria-pressed={tab === 'overview'}>档案概览</button><button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')} aria-pressed={tab === 'history'}>服务记录 <span>3</span></button></div>
    <div className={`device-detail-grid ${tab === 'history' ? 'history-only' : ''}`}>
      {tab === 'overview' && <section className="verified-facts panel"><div className="section-title"><h2>已核实的设备事实</h2><Icon of={ShieldCheck} size={19} /></div><p className="panel-description">每条事实保留来源。客户描述和 AI 推测不会自动写入这里。</p>
      {[['产品身份', 'Anker 737 充电宝', '演示设备登记'], ['持有人', '陈知夏', '客户授权的设备资料'], ['设备登记时间', '2026 年 4 月 13 日', '演示登记记录']].map(([label, value, source]) => <div className="verified-fact" key={label}><span>{label}</span><strong>{value}</strong><small><Icon of={CircleCheck} size={12} />{source}</small></div>)}
      <div className="fact-warning"><Icon of={FileText} size={18} /><div><strong>保修条件仍需独立核对</strong><p>设备已确认，不代表售后方案已获批准。实际政策未接入。</p></div></div></section>}
      <section className="service-history panel"><div className="section-title"><h2><Icon of={History} size={19} />服务记录</h2><Badge>3 次服务</Badge></div>{tab === 'history' && <label className="history-search"><Icon of={Search} size={16} /><input name="history-search" autoComplete="off" aria-label="搜索服务历史" value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索服务问题或处理结果…" /></label>}
        <ol className="device-timeline">{history.map(row => <li key={row.id}><span className={`history-marker ${row.current ? 'current' : ''}`}><Icon of={row.current && c.stage !== 'resolved' ? Clock3 : CheckCircle2} size={17} /></span><div><div className="history-row"><time>{row.date}</time><Badge tone={row.current && c.stage !== 'resolved' ? 'cyan' : 'green'}>{row.status}</Badge></div><h3>{row.title}{row.current && <span>当前服务</span>}</h3><p>{row.description}</p>{row.current ? <><div className="history-meta"><span>{c.evidence.length} 条证据</span><span>{c.activity.length} 条协作记录</span>{c.action?.receipt && <span>模拟回执已保存</span>}</div><Link className="text-link" to={`/desk?case=${c.id}`}>打开服务问题<Icon of={ArrowUpRight} size={13} /></Link></> : <div className="history-meta"><span>示例历史数据</span><span>客户确认结果</span></div>}</div></li>)}</ol>{history.length === 0 && <div className="empty-state"><Icon of={Search} size={28} /><strong>没有找到匹配记录</strong><p>试试“充电”或清除关键词。</p><Button onClick={() => setQuery('')}>显示全部记录</Button></div>}
      </section>
    </div>
    {tab === 'overview' && <section className="continuity-note"><span className="continuity-icon"><Icon of={BatteryCharging} size={26} /></span><div><h2>让下一次服务，从已有的了解开始。</h2><p>设备身份、已核实事实和服务历史按授权关联，避免重复询问；每一个新问题，仍作为独立服务问题处理。</p></div><Link to={`/support?case=${c.id}`}>返回用户服务<Icon of={ArrowUpRight} size={16} /></Link></section>}
    {c.stage === 'resolved' && <div className="archived-outcome"><Icon of={CheckCircle2} size={18} /><span>最新核验：{formatDate(c.activity.at(-1)!.time)} {formatTime(c.activity.at(-1)!.time)} · 客户确认已解决</span><code>{c.action?.receipt}</code></div>}
    <footer className="page-footer"><span><Icon of={ShieldCheck} size={12} />设备、服务问题与会话独立关联</span><span>示例资料 · 未接入真实设备系统</span></footer></div>;
}
const MessagesIcon = FileText;
