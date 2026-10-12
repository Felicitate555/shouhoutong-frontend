import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Headphones, PanelsTopLeft, MessagesSquare, Fingerprint, Search, ArrowUpRight, Sparkles, RotateCcw, Bell, ChevronRight, Command, BookOpen, CircleHelp, Check, ShieldCheck } from 'lucide-react';
import { useDemo } from '../domain/provider';
import { Avatar, Badge, Button, Dialog, Icon, IconButton } from './ui';

export function Shell() {
  const { state, dispatch, toast, storageWarning } = useDemo();
  const location = useLocation();
  const [panel, setPanel] = useState<'search' | 'help' | 'reset' | 'notifications' | null>(null);
  const [query, setQuery] = useState('');
  const support = location.pathname.startsWith('/support');
  const device = location.pathname.startsWith('/devices');
  const selectedCase = state.cases.find(c => c.id === new URLSearchParams(location.search).get('case')) ?? state.cases[0];
  useEffect(() => {
    function keyboard(e: KeyboardEvent) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPanel(p => p === 'search' ? null : 'search'); } }
    window.addEventListener('keydown', keyboard); return () => window.removeEventListener('keydown', keyboard);
  }, []);
  const found = (support ? [selectedCase] : state.cases).filter(c => `${c.customer} ${c.title} ${c.product} ${c.number}`.toLowerCase().includes(query.toLowerCase()));
  const notifications = support
    ? selectedCase.messages.filter(m => m.visibility === 'public' && m.role !== 'customer').map(m => ({ id: m.id, text: m.text, time: m.time, c: selectedCase }))
    : state.cases.flatMap(c => c.activity.map(a => ({ ...a, c })));
  return <div className="app-shell">
    <a className="skip-link" href="#main">跳到主要内容</a>
    <aside className="sidebar">
      <Link to="/desk" className="brand" aria-label="售后通，返回工作台"><span className="brand-symbol"><Icon of={Headphones} size={25} /></span><span>售后通<span className="brand-sub">让服务持续发生</span></span></Link>
      <div className="workspace-label">服务工作空间 <Badge tone="cyan">DEMO</Badge></div>
      <nav aria-label="主导航" className="main-nav">
        <NavLink to="/desk" aria-label="协作工作台" title="协作工作台"><Icon of={PanelsTopLeft} /><span>协作工作台</span><span className="nav-count">{state.cases.filter(c => c.stage !== 'resolved').length}</span></NavLink>
        <NavLink to="/support" aria-label="用户服务" title="用户服务"><Icon of={MessagesSquare} /><span>用户服务</span></NavLink>
        <NavLink to="/devices/demo-737" aria-label="设备档案" title="设备档案"><Icon of={Fingerprint} /><span>设备档案</span></NavLink>
      </nav>
      <div className="sidebar-space" />
      <div className="sidebar-note"><span className="sidebar-note-icon"><Icon of={Sparkles} size={19} /></span><strong>每一次协作，都有延续</strong><p>真人加入，AI 继续工作。<br />服务记录，跟随设备。</p><button onClick={() => setPanel('help')}>了解演示流程 <Icon of={ArrowUpRight} size={14} /></button></div>
      <div className="sidebar-tools"><button onClick={() => setPanel('help')}><Icon of={CircleHelp} size={17} />演示指南</button><button onClick={() => setPanel('reset')}><Icon of={RotateCcw} size={17} />重置演示</button></div>
      <div className="staff-profile"><Avatar name="晓" color="nav-avatar" /><div><strong>林晓</strong><span>售后服务专员</span></div><span className="online-dot" title="演示角色" /></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb"><span>工作空间</span><Icon of={ChevronRight} size={14} /><strong>{support ? '用户服务' : device ? '设备档案' : '协作工作台'}</strong></div>
        <div className="topbar-actions"><button className="global-search" aria-label="搜索工作空间" onClick={() => setPanel('search')}><Icon of={Search} size={16} /><span>搜索服务问题、设备…</span><kbd><Icon of={Command} size={11} /> K</kbd></button><span className="demo-top"><span />前端演示</span><IconButton icon={Bell} label="查看服务动态" onClick={() => setPanel('notifications')} /><Avatar name={support ? selectedCase.initials : '晓'} color={support ? selectedCase.color : 'mint'} small /></div>
      </header>
      {storageWarning && <div className="storage-warning" role="alert">浏览器无法保存演示状态。当前仍可使用，刷新会丢失新内容；请减少附件或允许本地存储。</div>}
      <main id="main" tabIndex={-1}><Outlet /></main>
    </div>
    <Dialog open={panel === 'search'} onClose={() => setPanel(null)} title="搜索工作空间">
      <div className="search-input"><Icon of={Search} /><input name="workspace-search" autoComplete="off" aria-label="搜索会话或设备" placeholder="输入客户、型号或服务编号…" value={query} onChange={e => setQuery(e.target.value)} /></div>
      <div className="search-results">{found.length ? found.map(c => <Link key={c.id} to={`${support ? '/support' : '/desk'}?case=${c.id}`} onClick={() => { setPanel(null); setQuery(''); }}><Avatar name={c.initials} color={c.color} /><div><strong>{c.title}</strong><span>{c.customer} · {c.product}</span></div><Icon of={ArrowUpRight} size={17} /></Link>) : <div className="empty-state"><Icon of={Search} size={30} /><strong>没有找到相关服务</strong><p>试试客户姓名、设备名称或服务编号。</p></div>}</div>
    </Dialog>
    <Dialog open={panel === 'help'} onClose={() => setPanel(null)} title="用一个问题，体验完整服务">
      <p className="dialog-intro">这是售后通的前端交互演示。对话、AI 建议、设备记录和换新办理均为本地模拟。</p>
      <ol className="guide-steps"><li><Icon of={MessagesSquare} /><div><strong>用户报告问题</strong><span>进入用户服务，完成排查或上传图片。</span></div></li><li><Icon of={Sparkles} /><div><strong>AI 与真人继续协作</strong><span>在工作台加入协作，采用草稿，提出方案。</span></div></li><li><Icon of={ShieldCheck} /><div><strong>批准后，再执行</strong><span>审批模拟换新，点击执行，生成模拟回执。</span></div></li><li><Icon of={Check} /><div><strong>用户核验，结果归档</strong><span>在用户服务确认结果，设备记录同步更新。</span></div></li></ol>
      <div className="dialog-footer"><Badge>刷新保留 · 一键重置</Badge><Button variant="primary" onClick={() => setPanel(null)} icon={BookOpen}>开始体验</Button></div>
    </Dialog>
    <Dialog open={panel === 'reset'} onClose={() => setPanel(null)} title="重新开始这次演示？"><p className="dialog-intro">新发送的消息、上传的图片和办理进度会清除，恢复最初的 4 个示例会话。原有产品文档不受影响。</p><div className="dialog-footer"><Button onClick={() => setPanel(null)}>保留当前进度</Button><Button variant="danger" icon={RotateCcw} onClick={() => { dispatch({ type: 'RESET' }); setPanel(null); toast('演示已重置，可以重新体验完整流程'); }}>重置演示</Button></div></Dialog>
    <Dialog open={panel === 'notifications'} onClose={() => setPanel(null)} title="最近服务动态"><div className="notification-list">{notifications.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6).map(a => <Link key={a.id} to={`${support ? '/support' : '/desk'}?case=${a.c.id}`} onClick={() => setPanel(null)}><span className="activity-mark"><Icon of={Check} size={13} /></span><div><strong>{a.text}</strong><span>{a.c.customer} · {a.c.title}</span></div><Icon of={ChevronRight} size={16} /></Link>)}</div></Dialog>
  </div>;
}
