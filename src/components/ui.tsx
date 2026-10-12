import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { X, type LucideIcon } from 'lucide-react';

export function Icon({ of: Glyph, size = 18, className = '' }: { of: LucideIcon; size?: number; className?: string }) { return <Glyph aria-hidden="true" size={size} strokeWidth={1.8} className={className} />; }
export function Button({ children, icon, variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: LucideIcon; variant?: 'primary' | 'secondary' | 'quiet' | 'danger' }) {
  return <button className={`button ${variant} ${className}`} type="button" {...props}>{icon && <Icon of={icon} size={16} />}{children}</button>;
}
export function IconButton({ icon, label, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string }) { return <button type="button" className="icon-button" aria-label={label} title={label} {...props}><Icon of={icon} /></button>; }
export function Avatar({ name, color = 'mint', small = false }: { name: string; color?: string; small?: boolean }) { return <span className={`avatar ${color} ${small ? 'small' : ''}`} aria-hidden="true">{name}</span>; }
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'cyan' | 'green' | 'amber' | 'red' }) { return <span className={`badge ${tone}`}>{children}</span>; }
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => { ref.current?.close(); previous?.focus(); };
  }, [open]);
  return <dialog ref={ref} className="dialog" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-label={title}>
    <div className="dialog-head"><h2>{title}</h2><IconButton icon={X} label="关闭窗口" onClick={onClose} /></div><div className="dialog-body">{children}</div>
  </dialog>;
}
