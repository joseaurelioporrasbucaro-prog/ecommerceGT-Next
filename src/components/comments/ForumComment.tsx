"use client";

import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import Link from 'next/link';
import React from 'react';

interface ForumCommentProps {
  authorName: string;
  authorHref: string;
  avatarSrc: string | StaticImageData;
  date: string;
  time?: string;
  title?: React.ReactNode;
  content: React.ReactNode;
  afterContent?: React.ReactNode;
  likes?: number;
  isLiked?: boolean;
  onLike?: () => void;
  repliesCount?: number;
  onReply?: () => void;
  children?: React.ReactNode;
}

const ForumComment = ({
  authorName,
  authorHref,
  avatarSrc,
  date,
  time,
  title,
  content,
  afterContent,
  likes = 0,
  isLiked = false,
  onLike,
  repliesCount = 0,
  onReply,
  children,
}: ForumCommentProps) => (
  <div className="q-single-wrapper publication-comment-item">
    <div className="q-single-content">
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
      {title && <h4 className="post-question">{title}</h4>}
      <p>{content}</p>
      {afterContent}
    </div>

    <div className="q-meta-content">
      {onLike ? (
        <button
          type="button"
          className="q-meta-item comment-like-btn"
          onClick={onLike}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: isLiked ? 'var(--tp-theme-1, #6c5ce7)' : 'inherit' }}
        >
          <div className="q-meta-icon">
            <i className={isLiked ? 'fas fa-heart' : 'flaticon-heart'} />
          </div>
          <div className="q-meta-likes" style={{ fontWeight: isLiked ? 700 : undefined }}>{likes}</div>
          <div className="q-meta-type">Likes</div>
        </button>
      ) : (
        <div className="q-meta-item">
          <div className="q-meta-icon">
            <i className="flaticon-heart" />
          </div>
          <div className="q-meta-likes">{likes}</div>
          <div className="q-meta-type">Likes</div>
        </div>
      )}
      <div className="q-meta-item">
        <div className="q-meta-icon">
          <i className="flaticon-chatting"></i>
        </div>
        <div className="q-meta-comments">{repliesCount}</div>
        <div className="q-meta-type">Respuestas</div>
      </div>
      {onReply && (
        <button type="button" className="q-meta-item forum-reply-action" onClick={onReply}>
          <div className="q-meta-icon">
            <i className="fal fa-reply"></i>
          </div>
          <div className="q-meta-comments">+</div>
          <div className="q-meta-type">Responder</div>
        </button>
      )}
    </div>

    {children}
  </div>
);

export default ForumComment;
