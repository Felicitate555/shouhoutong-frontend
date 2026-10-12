import { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, LockKeyhole, MessagesSquare, Sparkles, LoaderCircle } from 'lucide-react';
import type { ServiceCase } from '../domain/types';
import { useDemo } from '../domain/provider';
import { Button, Icon, IconButton } from './ui';

export function Composer({ serviceCase: c, customer = false, draft, onDraftUsed }: { serviceCase: ServiceCase; customer?: boolean; draft?: string; onDraftUsed?: () => void }) {
  const { dispatch, toast } = useDemo();
  const [text, setText] = useState('');
  const [internal, setInternal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => { setText(''); setError(''); }, [c.id]);
  useEffect(() => { if (draft) { setText(draft); setInternal(false); onDraftUsed?.(); input.current?.focus(); } }, [draft, onDraftUsed]);
  function submit() {
    if (!text.trim()) { setError('请先输入消息内容。'); input.current?.focus(); return; }
    dispatch({ type: 'MESSAGE', caseId: c.id, role: customer ? 'customer' : 'staff', visibility: !customer && internal ? 'internal' : 'public', text });
    setText(''); setError(''); toast(internal && !customer ? '内部备注已保存，仅客服可见' : '消息已发送到本地演示会话');
  }
  async function upload(value?: File) {
    if (!value) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(value.type) || value.size > 2 * 1024 * 1024) { setError('请选择不超过 2 MB 的 JPG、PNG 或 WebP 图片。'); if (file.current) file.current.value = ''; return; }
    setUploading(true); setError('');
    try {
      const result = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(value); });
      dispatch({ type: 'ATTACH', caseId: c.id, image: result, filename: value.name }); toast('图片已添加为待核验证据，仅保存在本地演示中');
    } catch { setError('图片读取失败，请重新选择。'); }
    finally { setUploading(false); if (file.current) file.current.value = ''; }
  }
  return <div className={`composer ${internal && !customer ? 'private-composer' : ''}`}>
    {!customer && <div className="composer-tabs"><button className={!internal ? 'active' : ''} aria-pressed={!internal} onClick={() => setInternal(false)}><Icon of={MessagesSquare} size={14} />回复客户</button><button className={internal ? 'active' : ''} aria-pressed={internal} onClick={() => setInternal(true)}><Icon of={LockKeyhole} size={14} />内部备注</button><span>{internal ? '仅客服可见' : '客户可见'}</span></div>}
    <form onSubmit={e => { e.preventDefault(); submit(); }}><textarea ref={input} name={customer ? 'customer-message' : 'staff-message'} autoComplete="off" aria-label={internal && !customer ? '输入内部备注' : '输入回复消息'} aria-invalid={!!error} aria-describedby={error ? 'composer-error' : undefined} placeholder={customer ? '描述你的问题，或补充设备情况…' : internal ? '记录内部信息，不会发送给客户…' : '回复客户，或采用右侧的 AI 草稿…'} value={text} onChange={e => { setText(e.target.value); setError(''); }} maxLength={4000} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} />
    {error && <p id="composer-error" className="form-error" role="alert">{error}</p>}
    <div className="composer-bottom"><div>{customer ? <><IconButton icon={uploading ? LoaderCircle : Paperclip} label={uploading ? '正在上传图片' : '上传图片证据'} disabled={uploading} onClick={() => file.current?.click()} /><input ref={file} type="file" accept="image/png,image/jpeg,image/webp" name="evidence-image" className="visually-hidden" aria-label="选择图片证据" onChange={e => void upload(e.target.files?.[0])} /><span>图片 ≤ 2 MB</span></> : <><Icon of={Sparkles} size={14} /><span>AI 草稿需由你审核后发送</span></>}</div><Button type="submit" variant="primary" icon={Send} disabled={uploading}>{internal && !customer ? '保存备注' : '发送'}</Button></div></form>
    <div className="composer-shortcut">Enter 发送 · Shift + Enter 换行<span>{customer ? '消息仅保存在当前浏览器' : '内部信息不会展示给客户'}</span></div>
  </div>;
}
