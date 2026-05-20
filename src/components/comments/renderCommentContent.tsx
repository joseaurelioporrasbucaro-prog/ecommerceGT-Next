import Link from 'next/link';
import React from 'react';
import type { CommentMention } from '@/types/api';

const MENTION_RE = /@([a-z0-9_]{3,30})/gi;

/**
 * Linkifica las menciones `@handle` de un comentario (Fase 6.3.3). Solo se
 * convierten en link los handles que el backend resolvió a un cusId (vienen en
 * `mentions`); los `@algo` sin match se dejan como texto plano.
 */
export function renderCommentContent(
  content: string,
  mentions?: CommentMention[],
): React.ReactNode {
  if (!content || !mentions || mentions.length === 0) {
    return content;
  }

  const byHandle = new Map(mentions.map((m) => [m.handle.toLowerCase(), m.cusId]));
  const parts: React.ReactNode[] = [];
  const re = new RegExp(MENTION_RE.source, 'gi');
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(content)) !== null) {
    const cusId = byHandle.get(match[1].toLowerCase());
    if (cusId === undefined) continue; // handle no resuelto → queda como texto

    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <Link
        key={`mention-${key++}`}
        href={`/creator-profile/${cusId}`}
        className="comment-mention"
      >
        @{match[1]}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (parts.length === 0) return content;
  if (lastIndex < content.length) parts.push(content.slice(lastIndex));
  return parts;
}
