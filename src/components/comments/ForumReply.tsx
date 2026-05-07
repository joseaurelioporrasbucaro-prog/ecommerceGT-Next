"use client";

import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import Link from 'next/link';
import React from 'react';

interface ForumReplyProps {
  authorName: string;
  authorHref: string;
  avatarSrc: string | StaticImageData;
  date: string;
  time?: string;
  content: string;
  likes?: number;
  /** Si se provee, muestra el botón "Reply" (estilo del forum del scaffold). */
  onReply?: () => void;
  likesLabel?: string;
  replyLabel?: string;
}

const ForumReply = ({
  authorName,
  authorHref,
  avatarSrc,
  date,
  time,
  content,
  likes = 0,
  onReply,
  likesLabel = 'Likes',
  replyLabel = 'Responder',
}: ForumReplyProps) => (
  <div className="q-single-answer">
    <div className="author-name-time">
      <div className="profile-img pos-rel">
        <Link href={authorHref}>
          <Image
            src={avatarSrc}
            alt={authorName}
            width={50}
            height={50}
            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </Link>
      </div>
      <div className="name-post-time">
        <h4 className="artist-name">
          <Link href={authorHref}>{authorName}</Link>
        </h4>
        <div className="post-date-time">
          <div className="post-date">{date}</div>
          {time && <div className="post-time item-border-before">{time}</div>}
        </div>
      </div>
    </div>
    <div className="answer-text">{content}</div>

    {/* Estructura idéntica al `q-single-answer` del scaffold (forum). */}
    <div className="ans-meta-content">
      <div className="q-meta-item">
        <div className="q-meta-icon">
          <i className="flaticon-heart"></i>
        </div>
        <div className="q-meta-likes">{likes}</div>
        <div className="q-meta-type">{likesLabel}</div>
      </div>
      {onReply && (
        <div className="q-meta-item">
          <button type="button" onClick={onReply}>
            <span className="q-meta-icon">
              <i className="flaticon-share-1"></i>
            </span>
            <span className="q-meta-type">{replyLabel}</span>
          </button>
        </div>
      )}
    </div>
  </div>
);

export default ForumReply;
