import { useEffect, useRef, useState } from 'react';
import { Sparkles, Check, ChevronDown, ArrowUpRight, ShieldCheck, FileText, Clock3, Users, ArrowRight, LoaderCircle, Fingerprint, LockKeyhole, CircleCheck, GitBranch, Image, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Mode, ServiceCase } from '../domain/types';
import { useDemo, formatTime } from '../domain/provider';
import { hasSafetyAlert } from '../domain/store';
import { Badge, Button, Icon } from './ui';

export function Copilot({ serviceCase: c, onDraft }: { serviceCase: ServiceCase; onDraft: (text: string) => void }) {
  const { dispatch, toast } = useDemo();
  const [tab, setTab] = useState('assist');
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setBusy(false); return () => { if (timer.current) clearTimeout(timer.current); }; }, [c.id]);
  const known = !!c.deviceId;
  const safetyAlert = hasSafetyAlert(c);
  const draft = safetyAlert ? '请先停止使用并安全断开电源，不要继续充电、通电测试或拆机。我会继续协助核对设备信息和处理条件。已有安全异常描述会保留为待核验证据。' : known ? '知夏，你的排查结果我已经了解了。接下来我会核对演示设备的售后条件，再提交模拟换新方案；办理进度和回执会在这里同步，你无需重复描述问题。' : `${c.customer}，你的问题我已经记录了。为了准确处理，请补充设备型号、购买时间，以及问题出现时的使用场景。我会根据这些信息继续协助你。`;
  const run = (type: 'JOIN' | 'PROPOSE' | 'APPROVE' | 'REJECT') => { dispatch({ type, caseId: c.id }); toast(type === 'JOIN' ? '已加入协作，AI 继续提供内部支持' : type === 'APPROVE' ? '方案已批准，请执行模拟动作' : type === 'REJECT' ? '方案已拒绝，尚未执行任何业务动作' : '已提出模拟方案，等待审批'); };
  function execute() { setBusy(true); timer.current = setTimeout(() => { dispatch({ type: 'EXECUTE', caseId: c.id }); setBusy(false); toast('本地模拟已完成，演示回执已生成'); }, 700); }
  return <aside className="copilot panel" aria-label="AI 内部协作面板"><div className="copilot-heading"><span className="copilot-logo"><Icon of={Sparkles} size={20} /></span><div><h2>AI 协作</h2><span>持续工作，与你并肩</span></div><span className="copilot-indicator" title="本地脚本演示" /></div>
    <div className="copilot-tabs" aria-label="协作面板视图">{[['assist', '协作'], ['evidence', '证据', c.evidence.length], ['activity', '记录']].map(([key, label, count]) => <button key={key} aria-pressed={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(String(key))}>{label}{count && <span>{count}</span>}</button>)}</div>
    <div className="copilot-content">{tab === 'assist' ? <>
      <div className="section-title"><h3>问题摘要</h3><Badge tone={c.stage === 'resolved' ? 'green' : 'cyan'}>{c.stage === 'resolved' ? '已核验' : '已整理'}</Badge></div>
      <div className={`diagnosis ${safetyAlert ? 'safety-alert' : ''}`}><strong>{safetyAlert ? '安全异常，优先处理' : c.title}</strong><p>{safetyAlert ? '客户描述存在安全异常。请优先提示停止使用、断开电源，再安排真人协助。不要引导继续通电排查；现有安全描述仍待核验。' : known ? '根据客户最初描述，无明显安全异常，已尝试更换连接线。设备身份已确认；现有描述指向充电输入问题，仍需进一步确认。' : '已整理客户描述。设备身份尚未确认，请补充型号与使用场景，再继续判断。'}</p><span><Icon of={FileText} size={12} />来源：当前对话与演示设备记录</span></div>
      <div className="section-title compact"><h3>Agent 工作记录</h3><span>本地演示</span></div>
      <ul className="agent-tasks"><li><Icon of={known ? CircleCheck : Clock3} size={15} /><span>{known ? '读取已授权设备资料' : '等待确认设备身份'}</span><small>{known ? '完成' : '待补充'}</small></li><li><Icon of={CircleCheck} size={15} /><span>整理对话与排查证据</span><small>完成</small></li><li><Icon of={CircleCheck} size={15} /><span>生成待审核回复草稿</span><small>完成</small></li></ul>
      <div className="reply-draft"><div><span><Icon of={Sparkles} size={15} /><strong>建议回复</strong></span><Badge>仅内部</Badge></div><p>{draft}</p><Button icon={ArrowUpRight} onClick={() => { onDraft(draft); toast('草稿已放入回复框，请审核后发送'); }}>采用草稿</Button></div>
      <div className="collaboration-policy"><label htmlFor="collaboration-mode"><Icon of={Users} size={14} />当前协作模式</label><div><select id="collaboration-mode" name="collaboration-mode" value={c.mode} onChange={e => { const mode = e.target.value as Mode; if (c.stage === 'diagnosing' && mode !== 'AI_LEAD') { dispatch({ type: 'JOIN', caseId: c.id }); if (mode === 'HUMAN_LEAD') dispatch({ type: 'MODE', caseId: c.id, mode }); } else dispatch({ type: 'MODE', caseId: c.id, mode }); }}><option value="AI_LEAD">AI 主导</option><option value="CO_SERVICE">共同服务</option><option value="HUMAN_LEAD">真人主导</option></select><Icon of={ChevronDown} size={14} /></div><p><Icon of={LockKeyhole} size={12} />{c.mode === 'AI_LEAD' ? 'AI 可公开回复 · 售后动作仍需审批' : c.mode === 'CO_SERVICE' ? '真人审核公开回复 · AI 继续内部工作' : '仅真人公开回复 · AI 提供内部协助'}</p></div>
    </> : tab === 'evidence' ? <><div className="section-title"><h3>当前证据</h3><Badge>{c.evidence.length} 条</Badge></div><p className="panel-description">客户描述与已核实事实独立记录。AI 整理的内容不会自动成为设备事实。</p><div className="evidence-list">{c.evidence.map(e => <div key={e.id}><span className="evidence-icon"><Icon of={e.image ? Image : e.verified ? Fingerprint : FileText} size={17} /></span><div><strong>{e.title}</strong><p>{e.detail}</p><span>{e.source} · {e.verified ? '已核实' : '待核验'}</span>{e.image && <img src={e.image} alt="用户上传的设备证据" width="210" height="140" loading="lazy" />}</div></div>)}</div>{known && <Link className="button secondary" to={`/devices/${c.deviceId}`}>查看设备档案 <Icon of={ArrowUpRight} size={14} /></Link>}</>
    : <><div className="section-title"><h3>协作时间线</h3><Badge>{c.activity.length} 条</Badge></div><p className="panel-description">每一次审批、执行和核验都有独立记录。</p><ol className="activity-timeline">{c.activity.map((a, i) => <li key={a.id}><span className={`timeline-dot ${i === c.activity.length - 1 ? 'latest' : ''}`} /><div><time>{formatTime(a.time)}</time><p>{a.text}</p></div></li>)}</ol>{c.action?.receipt && <Button icon={Copy} onClick={async () => { try { await navigator.clipboard.writeText(c.action!.receipt!); toast('模拟回执已复制'); } catch { toast('浏览器未允许复制，请选中回执文本复制'); } }}>复制模拟回执</Button>}</>}
    </div>{tab === 'assist' && (<div className="action-area"><div className="section-title"><h3>下一步行动</h3><Icon of={GitBranch} size={16} /></div>
        {c.stage === 'resolved' ? <div className="completed-action"><Icon of={CircleCheck} size={26} /><strong>本次问题已解决</strong><p>客户核验完成，结果已归档。</p>{known && <Link to={`/devices/${c.deviceId}`}>查看设备服务记录 <Icon of={ArrowUpRight} size={13} /></Link>}</div>
          : c.stage === 'diagnosing' || c.mode === 'AI_LEAD' ? <><p>已有信息已整理，真人可以直接加入，无需客户重述。</p><Button variant="primary" icon={Users} onClick={() => run('JOIN')}>加入协作 <Icon of={ArrowRight} size={14} /></Button></>
          : c.stage === 'collaborating' ? <><p>{c.action?.status === 'SUCCEEDED' ? '原有回执已保留。客户反馈仍未解决，请继续沟通和收集证据。' : c.action?.status === 'REJECTED' ? '方案未通过审批。补充信息后，可重新提出方案。' : known ? '核对演示售后条件，提出一次模拟换新方案。' : '先在对话中确认设备信息，避免将推测写入档案。'}</p>{known && c.action?.status !== 'SUCCEEDED' && <Button variant="primary" icon={ShieldCheck} onClick={() => run('PROPOSE')}>提出模拟换新</Button>}</>
          : c.stage === 'approval' ? <><div className="approval-detail"><span>申请动作<strong>模拟设备换新</strong></span><span>审批人<strong>林晓 · 演示客服</strong></span><span>执行范围<strong>仅本地，不会发货</strong></span></div><div className="approval-buttons"><Button variant="primary" icon={Check} onClick={() => run('APPROVE')}>批准方案</Button><Button onClick={() => run('REJECT')}>拒绝</Button></div></>
          : c.stage === 'approved' ? <><div className="approved-notice"><Icon of={ShieldCheck} size={18} /><span>审批已通过，动作尚未执行。</span></div><Button variant="primary" icon={busy ? LoaderCircle : ArrowRight} disabled={busy} onClick={execute}>{busy ? '本地执行中…' : '执行模拟换新'}</Button></>
          : <><div className="approved-notice"><Icon of={CircleCheck} size={18} /><span>模拟办理完成，等待客户核验。</span></div><code className="action-receipt">{c.action?.receipt}</code><Link className="button secondary" to={`/support?case=${c.id}`}>进入用户视图核验<Icon of={ArrowUpRight} size={14} /></Link></>}
      </div>)}<div className="copilot-footer"><Icon of={ShieldCheck} size={13} />内部协作区 · 客户不可见</div>
  </aside>;
}
