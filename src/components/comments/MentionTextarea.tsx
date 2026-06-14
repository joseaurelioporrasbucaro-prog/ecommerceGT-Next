"use client";

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchUsers } from '@/hooks/api/useSearchUsers';
import type { UserSearchResult } from '@/types/api';

const DEFAULT_AVATAR = '/assets/img/profile/avatar.png';

/** Detecta un token `@palabra` que termina justo en el caret (inicio o tras espacio). */
const MENTION_AT_CARET = /(?:^|\s)@([a-z0-9_]{0,30})$/i;

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Textarea con dropdown de menciones (@usuario) — Fase 6.3.3.
 * Al escribir `@` seguido de ≥2 chars consulta `GET /search/users` y muestra
 * sugerencias; al elegir una inserta `@handle ` en la posición del caret.
 */
const MentionTextarea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled,
  autoFocus,
}: MentionTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(0);
  const [caretToRestore, setCaretToRestore] = useState<number | null>(null);

  const { data, isLoading } = useSearchUsers(mentionQuery ?? '');
  const suggestions =
    mentionQuery !== null && mentionQuery.length >= 2 ? data?.users ?? [] : [];
  const open = mentionQuery !== null && mentionQuery.length >= 2;

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  // Tras insertar una mención (cambia value), reponer el caret donde corresponde.
  useEffect(() => {
    if (caretToRestore !== null && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.setSelectionRange(caretToRestore, caretToRestore);
      setCaretToRestore(null);
    }
  }, [caretToRestore, value]);

  const detectMention = (text: string, caret: number) => {
    const m = MENTION_AT_CARET.exec(text.slice(0, caret));
    setMentionQuery(m ? m[1] : null);
    setHighlight(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);
    detectMention(text, e.target.selectionStart ?? text.length);
  };

  const selectUser = (user: UserSearchResult) => {
    const el = textareaRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? value.length;
    const m = MENTION_AT_CARET.exec(value.slice(0, caret));
    if (!m) return;
    const atStart = caret - m[1].length - 1; // posición del '@'
    const before = value.slice(0, atStart);
    const after = value.slice(caret);
    const inserted = `@${user.handle} `;
    onChange(before + inserted + after);
    setMentionQuery(null);
    setCaretToRestore(before.length + inserted.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectUser(suggestions[highlight]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setMentionQuery(null);
    }
  };

  return (
    <div className="mention-textarea-wrap">
      <textarea
        ref={textareaRef}
        className="form-control"
        rows={rows}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        // Delay para que el onMouseDown del item alcance a dispararse antes de cerrar.
        onBlur={() => window.setTimeout(() => setMentionQuery(null), 150)}
        placeholder={placeholder}
        disabled={disabled}
      />

      {open && (suggestions.length > 0 || isLoading) && (
        <ul className="mention-dropdown">
          {isLoading && suggestions.length === 0 ? (
            <li className="mention-empty">Buscando…</li>
          ) : (
            suggestions.map((u: UserSearchResult, i: number) => (
              <li key={u.cusId}>
                <button
                  type="button"
                  className={`mention-option ${i === highlight ? 'active' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectUser(u);
                  }}
                  onMouseEnter={() => setHighlight(i)}
                >
                  <Image
                    src={u.avatar || DEFAULT_AVATAR}
                    alt=""
                    width={28}
                    height={28}
                    unoptimized
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span className="mention-name">
                    {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.handle}
                  </span>
                  <span className="mention-handle">@{u.handle}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      <style jsx>{`
        .mention-textarea-wrap {
          position: relative;
        }
        .mention-dropdown {
          position: absolute;
          z-index: 50;
          left: 0;
          right: 0;
          margin: 6px 0 0;
          padding: 6px;
          list-style: none;
          max-height: 260px;
          overflow-y: auto;
          background: var(--bg-elevated);
          border: 1.5px solid var(--border);
          border-radius: var(--r-md);
          box-shadow: var(--shadow-md);
        }
        .mention-empty {
          padding: 10px 12px;
          font-size: 13px;
          color: var(--fg-muted);
        }
        .mention-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          background: transparent;
          border: 0;
          border-radius: var(--r-sm);
          cursor: pointer;
          text-align: left;
          color: var(--fg-strong);
          transition: background 0.15s ease;
        }
        .mention-option.active,
        .mention-option:hover {
          background: var(--accent-soft);
        }
        .mention-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--fg-strong);
        }
        .mention-handle {
          font-size: 13px;
          color: var(--accent);
        }
        :global([data-theme='dark']) .mention-handle {
          color: var(--lav-400);
        }
      `}</style>
    </div>
  );
};

export default MentionTextarea;
