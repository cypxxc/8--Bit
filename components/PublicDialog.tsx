"use client";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
export default function PublicDialog({open,onClose,label,children}:{open:boolean;onClose:()=>void;label:string;children:ReactNode}) {
  const ref=useRef<HTMLDialogElement>(null);
  useLayoutEffect(()=>{
    const d=ref.current;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    if(open && !d?.open)d?.showModal();else if(!open && d?.open)d.close();
    return()=>{if(d?.open)d.close();if(open && previous?.isConnected)previous.focus();};
  },[open]);
  useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[open]);
  return <dialog ref={ref} aria-label={label} className="public-dialog" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>{children}</dialog>;
}
