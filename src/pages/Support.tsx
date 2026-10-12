import { Link, useSearchParams } from 'react-router-dom';
import { Headphones, ArrowUpRight, ShieldCheck, Users, Check, ArrowRight, Clock3, Fingerprint, CheckCircle2, RefreshCcw } from 'lucide-react';
import { useDemo } from '../domain/provider';
import { Badge, Button, Icon } from '../components/ui';
import { CaseHeader } from '../components/CaseHeader';
import { MessageThread } from '../components/MessageThread';
import { Composer } from '../components/Composer';

export function Support() {
  const { state, dispatch, toast } = useDemo();
  const [params, setParams] = useSearchParams();
  const c = state.cases.find(item => item.id === params.get('case')) ?? state.cases[0];
  return <div className="support-page"><div className="page-heading"><div><h1>你的问题，我们一起解决。</h1><p>从第一次问询，到每一次确认，服务始终在这里。</p></div><Link className="button secondary" to={`/desk?case=${c.id}`}>客服工作台 <Icon of={ArrowUpRight} size={15} /></Link></div>
    <div className="support-grid"><section className="support-conversation panel"><div className="support-service-header"><span className="support-brand-icon"><Icon of={Headphones} size={23} /></span><div><strong>售后通服务</strong><span><span className="status-dot" />{c.mode === 'AI_LEAD' ? 'AI 为你服务 · 可申请真人协助' : '林晓与你协作 · AI 继续提供支持'}</span></div><Badge>前端模拟</Badge></div><CaseHeader serviceCase={c} /><MessageThread serviceCase={c} customer />
      {c.stage === 'verification' && <div className="verification-banner"><span><Icon of={CheckCircle2} size={22} /><strong>最后一步，确认服务结果</strong></span><p>模拟办理已经完成。这次问题是否已解决？</p><div><Button variant="primary" icon={Check} onClick={() => { dispatch({ type: 'VERIFY', caseId: c.id, solved: true }); toast('核验已完成，服务结果已归档'); }}>模拟确认已解决</Button><Button icon={RefreshCcw} onClick={() => dispatch({ type: 'VERIFY', caseId: c.id, solved: false })}>仍未解决</Button></div></div>}
      {c.stage === 'resolved' && <div className="resolved-banner"><Icon of={CheckCircle2} size={20} /><span>服务已完成，感谢你的确认。</span>{c.deviceId && <Link to={`/devices/${c.deviceId}`}>查看服务记录<Icon of={ArrowUpRight} size={12} /></Link>}</div>}
      <Composer key={c.id} serviceCase={c} customer /></section>
      <aside className="support-side"><div className="support-device panel"><div className="section-title"><h2>正在服务的设备</h2><Icon of={Fingerprint} size={18} /></div>{c.deviceId ? <div className="device-art"><img src="/device-diagram.svg" width="148" height="172" alt="充电宝设备示意图，并非官方产品图片" /><span>设备示意图</span></div> : <div className="device-unknown"><Icon of={Fingerprint} size={42} /><strong>等待确认设备身份</strong><span>描述已记录，档案尚未建立</span></div>}<h3>{c.product}</h3><p>{c.deviceId ? '已确认设备 · 资料已授权读取' : '设备身份待确认'}</p>{c.deviceId ? <Link className="button secondary" to={`/devices/${c.deviceId}`}>查看设备档案<Icon of={ArrowUpRight} size={14} /></Link> : <Badge tone="amber">请在对话中补充设备型号</Badge>}<div className="device-safety"><Icon of={ShieldCheck} size={16} /><span>设备出现异常发热、鼓包或异味时，请立即停止使用。</span></div></div>
      <div className="support-help panel"><span className="support-help-icon"><Icon of={Users} size={21} /></span><h2>需要真人一起处理？</h2><p>已有对话和排查记录会同步，<br />不用从头再说一遍。</p><Button icon={c.requestedHuman || c.mode !== 'AI_LEAD' ? Check : Users} disabled={c.requestedHuman || c.mode !== 'AI_LEAD'} onClick={() => { dispatch({ type: 'REQUEST_HUMAN', caseId: c.id }); toast('真人协助请求已记录，可在客服工作台加入协作'); }}>{c.mode !== 'AI_LEAD' ? '林晓已加入服务' : c.requestedHuman ? '协助请求已提交' : '申请真人协助'}</Button>{c.requestedHuman && c.mode === 'AI_LEAD' && <Link className="text-link" to={`/desk?case=${c.id}`}>进入客服端体验协作<Icon of={ArrowRight} size={13} /></Link>}</div>
      <div className="support-record"><Icon of={Clock3} size={16} /><div><strong>服务会持续保存</strong><p>你可以离开再回来，本次对话和处理进度会保留在当前浏览器。</p></div></div>
      <label className="scenario-select">切换演示场景<select name="support-scenario" value={c.id} onChange={e => setParams({ case: e.target.value })}>{state.cases.map(item => <option key={item.id} value={item.id}>{item.customer} · {item.title}</option>)}</select></label>
      </aside></div><footer className="page-footer"><span>每一次售后，都为下一次服务留下依据。</span><span>本地演示 · 无实际发货或业务提交</span></footer></div>;
}
