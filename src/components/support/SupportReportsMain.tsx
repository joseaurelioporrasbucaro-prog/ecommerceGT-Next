"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ThemeChanger from '@/components/home/ThemeChanger';
import { useAuth } from '@/utils/AuthContext';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useSupportReports, useResolveReport, useMessageContext } from '@/hooks/api/useSupportReports';
import { useBanUser } from '@/hooks/api/useSupportUsers';
import { useDateFmt } from '@/utils/datetime';
import Pagination from './Pagination';
import StaffShell from '@/components/support/StaffShell';
import { DataTable, Row, Cell, StatusChip, FilterTabs } from '@/components/support/staffUi';
import type { SupportReportRow, ConversationContextMessage, ReportType } from '@/types/api';

const PAGE_SIZE = 15;

// Color del chip de tipo de contenido (solo color; el label sigue traducido).
const TYPE_CHIP: Record<ReportType, { bg: string; fg: string }> = {
  comment: { bg: 'var(--lav-200)', fg: 'var(--lav-700)' },
  message: { bg: 'var(--green-100)', fg: 'var(--green-800)' },
  publication: { bg: 'var(--navy-100)', fg: 'var(--navy-700)' },
};

const contentHref = (r: SupportReportRow): string | null => {
  if (r.report_type === 'publication') return `/publications/${r.content_id}`;
  if (r.report_type === 'comment' && r.pub_id) return `/publications/${r.pub_id}`;
  return null;
};

// Modal del contexto de la conversación de un mensaje denunciado.
const ConversationModal = ({ messageId, onClose }: { messageId: number; onClose: () => void }) => {
  const t = useTranslations('support');
  const dateFmt = useDateFmt();
  const { data, isLoading } = useMessageContext(messageId);
  return (
    <div className="sr-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sr-convo" onClick={(e) => e.stopPropagation()}>
        <h5>{t('reports.conversation')}</h5>
        {isLoading && <p style={{ opacity: 0.6 }}>{t('common.loading')}</p>}
        <div className="sr-convo-list">
          {data?.messages.map((m: ConversationContextMessage) => (
            <div key={m.message_id} className={`sr-bubble ${m.message_id === data.reportedMessageId ? 'reported' : ''}`}>
              <div className="sr-bubble-head">
                <strong>{`${m.first ?? ''} ${m.last ?? ''}`.trim() || t('common.user')}</strong>
                <span>{dateFmt.dateTime(m.created_at)}</span>
              </div>
              <p>{m.content}</p>
              {m.message_id === data?.reportedMessageId && <span className="sr-reported-tag">{t('reports.reportedMessage')}</span>}
            </div>
          ))}
        </div>
        <div className="sr-convo-actions"><button className="sr-btn sr-dismiss" onClick={onClose}>{t('common.close')}</button></div>
      </div>
      <style jsx>{`
        .sr-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(20,24,40,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .sr-convo { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--shadow-lg); padding: 22px; width: 100%; max-width: 560px; max-height: 80vh; display: flex; flex-direction: column; }
        .sr-convo h5 { margin: 0 0 14px; font-family: var(--font-display); color: var(--fg-strong); }
        .sr-convo-list { overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .sr-bubble { border: 1px solid var(--border); border-radius: var(--r-md); padding: 10px 12px; background: var(--surface-sunk); }
        .sr-bubble.reported { border-color: var(--danger); background: var(--danger-bg); }
        .sr-bubble-head { display: flex; justify-content: space-between; font: var(--text-caption); color: var(--fg-muted); margin-bottom: 4px; }
        .sr-bubble p { margin: 0; white-space: pre-wrap; color: var(--fg); }
        .sr-reported-tag { display: inline-block; margin-top: 6px; font: var(--text-caption); font-weight: 700; color: var(--danger); }
        .sr-convo-actions { display: flex; justify-content: flex-end; margin-top: 14px; }
        .sr-btn { border: 1px solid var(--border-strong); cursor: pointer; font-weight: 600; padding: 8px 16px; border-radius: 999px; background: var(--surface); color: var(--fg-muted); }
      `}</style>
    </div>
  );
};

const SupportReportsMain = () => {
  const t = useTranslations('support');
  const dateFmt = useDateFmt();
  const { user } = useAuth();
  const [status, setStatusRaw] = useState<'pending' | 'resolved' | 'dismissed'>('pending');
  const [page, setPage] = useState(1);
  const setStatus = (s: 'pending' | 'resolved' | 'dismissed') => { setStatusRaw(s); setPage(1); };
  const { data, isLoading } = useSupportReports(status);
  const resolve = useResolveReport();
  const ban = useBanUser();

  const [convoMsgId, setConvoMsgId] = useState<number | null>(null);
  // Sanción al autor.
  const [banRow, setBanRow] = useState<SupportReportRow | null>(null);
  const [banStatus, setBanStatus] = useState<'suspended' | 'banned'>('suspended');
  const [banReason, setBanReason] = useState('');
  const [banDays, setBanDays] = useState(7);

  const isSupport = user?.role === 'support' || user?.role === 'admin';

  const act = (r: SupportReportRow, action: 'dismiss' | 'delete') => {
    if (action === 'delete') {
      // Fase 10.6: si la publicación está pautada, advertir que se finaliza
      // la campaña y se reembolsa al anunciante.
      const remaining = r.active_camp_remaining != null ? Number(r.active_camp_remaining) : 0;
      const isPubPautada = r.report_type === 'publication' && remaining > 0;
      const baseMsg = t('reports.confirmDelete');
      const extra = isPubPautada
        ? t('reports.confirmDeleteCampaign', { amount: remaining.toFixed(2) })
        : '';
      if (!window.confirm(baseMsg + extra)) return;
    }
    resolve.mutate(
      { type: r.report_type, reportId: r.report_id, contentId: r.content_id, action },
      {
        onSuccess: (res) => toast.success(res.message || t('common.done')),
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('reports.resolveError')),
      },
    );
  };

  const confirmBan = () => {
    if (!banRow) return;
    if (banReason.trim().length < 4) { toast.error(t('common.reasonRequired')); return; }
    ban.mutate(
      { cusId: banRow.author_id, status: banStatus, reason: banReason.trim(), days: banStatus === 'suspended' ? banDays : undefined },
      {
        onSuccess: (r) => { toast.success(r.message || t('reports.userSanctioned')); setBanRow(null); setBanReason(''); },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('common.sanctionError')),
      },
    );
  };

  const rows = data ?? [];
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cols = [
    { label: t('table.type') },
    { label: t('table.content') },
    { label: t('table.author') },
    { label: t('table.reason') },
    { label: t('table.date') },
    ...(status === 'pending' ? [{ label: t('table.actions'), right: true }] : []),
  ];

  return (
    <main>
      <ThemeChanger />
      <StaffShell active="reports" title={t('reports.title')} sub={t('reports.sub')}>
        {!isSupport ? (
          <div
            style={{
              padding: '14px 18px', borderRadius: 'var(--r-md)',
              background: 'var(--danger-bg)', color: 'var(--danger)',
              font: 'var(--text-body-sm)', fontWeight: 600,
            }}
          >
            {t('common.restricted')}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 18 }}>
              <FilterTabs
                active={status}
                onSelect={(k) => setStatus(k as 'pending' | 'resolved' | 'dismissed')}
                tabs={(['pending', 'resolved', 'dismissed'] as const).map((v) => [v, t(`reports.status.${v}`)])}
              />
            </div>

            {isLoading && <p style={{ color: 'var(--fg-subtle)' }}>{t('common.loading')}</p>}
            {!isLoading && rows.length === 0 && <p style={{ color: 'var(--fg-subtle)' }}>{t('reports.empty')}</p>}

            {rows.length > 0 && (
              <>
                <DataTable cols={cols} minWidth={860}>
                  {paged.map((r: SupportReportRow) => {
                    const author = `${r.author_first ?? ''} ${r.author_last ?? ''}`.trim() || t('common.user');
                    const href = contentHref(r);
                    // Fase 10.6: la publicación asociada está pautada.
                    const remaining = r.active_camp_remaining != null ? Number(r.active_camp_remaining) : null;
                    const isPautada = remaining !== null && remaining > 0;
                    const typeChip = TYPE_CHIP[r.report_type];
                    return (
                      <Row key={`${r.report_type}-${r.report_id}`}>
                        <Cell>
                          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                            <span
                              style={{
                                display: 'inline-flex', padding: '2px 10px', borderRadius: '999px',
                                background: typeChip.bg, color: typeChip.fg, font: 'var(--text-caption)', fontWeight: 700,
                              }}
                            >
                              {t(`reports.type.${r.report_type}`)}
                            </span>
                            {isPautada && (
                              <span
                                title={t('reports.activeCampaignTitle', { amount: remaining!.toFixed(2) })}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px',
                                  borderRadius: '999px', background: 'linear-gradient(135deg,var(--lav-500),var(--lav-600))',
                                  color: '#fff', font: 'var(--text-caption)', fontWeight: 700,
                                  boxShadow: '0 2px 6px rgba(109,98,207,0.3)',
                                }}
                              >
                                <i className="fas fa-bolt" style={{ fontSize: 9 }} /> {t('reports.promoted', { amount: remaining!.toFixed(2) })}
                              </span>
                            )}
                          </span>
                        </Cell>
                        <Cell strong>
                          <span style={{ display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.content_excerpt || t('reports.noText')}
                          </span>
                          {r.report_type === 'message' ? (
                            <button
                              type="button"
                              onClick={() => setConvoMsgId(r.content_id)}
                              style={{ font: 'var(--text-caption)', color: 'var(--lav-700)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}
                            >
                              {t('reports.viewConversation')}
                            </button>
                          ) : href ? (
                            <Link href={href} target="_blank" style={{ font: 'var(--text-caption)', color: 'var(--lav-700)', fontWeight: 600, textDecoration: 'none' }}>
                              {t('common.view')}
                            </Link>
                          ) : null}
                        </Cell>
                        <Cell muted>
                          <Link href={`/creator-profile/${r.author_id}`} target="_blank" style={{ color: 'var(--accent-hover)', textDecoration: 'none' }}>
                            {author}{r.author_handle ? ` @${r.author_handle}` : ''}
                          </Link>
                        </Cell>
                        <Cell>
                          <StatusChip s="open">
                            <i className="fas fa-flag" style={{ fontSize: 9 }} /> {r.reason}
                          </StatusChip>
                          {r.detail && <div style={{ font: 'var(--text-caption)', color: 'var(--fg-subtle)', marginTop: 4 }}>{r.detail}</div>}
                        </Cell>
                        <Cell muted mono>{dateFmt.short(r.created_at)}</Cell>
                        {status === 'pending' && (
                          <Cell right>
                            <span style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button className="kq-btn kq-btn--outline kq-btn--sm" onClick={() => act(r, 'dismiss')} disabled={resolve.isPending} title={t('reports.dismiss')}>
                                <i className="fas fa-check" /> {t('reports.dismiss')}
                              </button>
                              <button className="kq-btn kq-btn--ghost kq-btn--sm" style={{ color: 'var(--danger)' }} onClick={() => act(r, 'delete')} disabled={resolve.isPending} title={t('reports.deleteContent')}>
                                <i className="fas fa-trash" /> {t('reports.delete')}
                              </button>
                              <button className="kq-btn kq-btn--ghost kq-btn--sm" onClick={() => { setBanRow(r); setBanStatus('suspended'); setBanReason(''); }} title={t('reports.sanctionAuthor')}>
                                <i className="fas fa-ban" /> {t('reports.sanctionAuthor')}
                              </button>
                            </span>
                          </Cell>
                        )}
                      </Row>
                    );
                  })}
                </DataTable>
                {paged.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </StaffShell>

      {convoMsgId != null && <ConversationModal messageId={convoMsgId} onClose={() => setConvoMsgId(null)} />}

      {banRow && (
        <div className="sr-overlay" role="dialog" aria-modal="true">
          <div className="sr-modal">
            <h5>{t('reports.sanctionAuthor')}</h5>
            <p className="sr-modal-sub">{`${banRow.author_first ?? ''} ${banRow.author_last ?? ''}`.trim()}{banRow.author_handle ? ` · @${banRow.author_handle}` : ''}</p>
            <div className="sr-radio-row">
              <label className={banStatus === 'suspended' ? 'active' : ''}>
                <input type="radio" checked={banStatus === 'suspended'} onChange={() => setBanStatus('suspended')} /> {t('common.suspendTemporary')}
              </label>
              <label className={banStatus === 'banned' ? 'active' : ''}>
                <input type="radio" checked={banStatus === 'banned'} onChange={() => setBanStatus('banned')} /> {t('common.banPermanent')}
              </label>
            </div>
            {banStatus === 'suspended' && (
              <div className="sr-days">
                <label>{t('common.duration')}</label>
                {[7, 15, 30].map((d) => (
                  <button key={d} type="button" className={`sr-day ${banDays === d ? 'active' : ''}`} onClick={() => setBanDays(d)}>{t('common.days', { count: d })}</button>
                ))}
                <input type="number" min={1} max={3650} value={banDays} onChange={(e) => setBanDays(Math.max(1, Number(e.target.value) || 1))} />
              </div>
            )}
            <textarea rows={3} placeholder={t('common.sanctionReasonPlaceholder')} value={banReason} onChange={(e) => setBanReason(e.target.value)} autoFocus />
            <div className="sr-modal-actions">
              <button className="sr-btn sr-dismiss" onClick={() => setBanRow(null)}>{t('common.cancel')}</button>
              <button className="sr-btn sr-sanction-full" onClick={confirmBan} disabled={ban.isPending}>
                {ban.isPending ? t('common.applying') : (banStatus === 'banned' ? t('common.ban') : t('common.suspend'))}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sr-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(20,24,40,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .sr-modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--shadow-lg); padding: 24px; width: 100%; max-width: 460px; }
        .sr-modal h5 { margin: 0 0 4px; font-family: var(--font-display); color: var(--fg-strong); }
        .sr-modal-sub { color: var(--fg-muted); font: var(--text-body-sm); margin: 0 0 14px; }
        .sr-radio-row { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .sr-radio-row label { flex: 1; min-width: 150px; border: 1px solid var(--border-strong); border-radius: var(--r-md); padding: 10px 12px; cursor: pointer; font: var(--text-body-sm); color: var(--fg); display: flex; align-items: center; gap: 8px; }
        .sr-radio-row label.active { border-color: var(--lav-500); background: var(--accent-soft); }
        .sr-days { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .sr-days label { font: var(--text-body-sm); font-weight: 600; color: var(--fg-strong); }
        .sr-day { padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--fg-muted); cursor: pointer; font: var(--text-caption); font-weight: 600; }
        .sr-day.active { background: var(--navy-800); color: var(--cream); border-color: transparent; }
        .sr-days input { width: 80px; border: 1px solid var(--border-strong); border-radius: var(--r-md); padding: 7px 10px; background: var(--surface); color: var(--fg); }
        .sr-modal textarea { width: 100%; border: 1px solid var(--border-strong); border-radius: var(--r-md); padding: 10px; resize: vertical; background: var(--surface); color: var(--fg); }
        .sr-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
        .sr-btn { border: 1px solid var(--border-strong); cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 999px; font: var(--text-body-sm); white-space: nowrap; }
        .sr-btn:disabled { opacity: 0.6; cursor: default; }
        .sr-dismiss { background: var(--surface); color: var(--fg-muted); }
        .sr-sanction-full { background: var(--danger); color: #fff; border-color: transparent; }
      `}</style>
    </main>
  );
};

export default SupportReportsMain;
