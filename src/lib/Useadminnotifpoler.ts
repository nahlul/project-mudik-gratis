// src/hooks/useAdminNotifPoller.ts — FIXED v2
// Polling 30 detik: deteksi pendaftar baru, user perbaiki data, feedback baru.

import { useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import { AdminAPI, FeedbackAPI } from './api';

const POLL_INTERVAL = 30_000;

// Key v2 → bersih dari cache lama yang bisa corrupt
const KEY_SEEN_STATUS   = 'admin_seen_status_v2';
const KEY_SEEN_FEEDBACK = 'admin_seen_feedback_v2';

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
}

function saveSet(key: string, s: Set<string>) {
  try { localStorage.setItem(key, JSON.stringify([...s].slice(-500))); } catch {}
}

export function useAdminNotifPoller() {
  const { addNotif } = useNotification();

  // Key format: "familyId:status" → notif muncul ulang kalau status berubah
  // Contoh: keluarga 5 tadinya DITERIMA, user perbaiki → status MENUNGGU lagi = notif baru
  const seenStatus   = useRef<Set<string>>(loadSet(KEY_SEEN_STATUS));
  const seenFeedback = useRef<Set<string>>(loadSet(KEY_SEEN_FEEDBACK));
  const isFirstPendaftar = useRef(true);
  const isFirstFeedback  = useRef(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const pollPendaftar = async () => {
      try {
        const data = await AdminAPI.getPendaftar();
        if (!Array.isArray(data) || data.length === 0) return;

        // Kumpulkan status terpenting per keluarga
        // BUG FIX: id_keluarga selalu cast ke String supaya Set.has() tidak miss
        const familyMap = new Map<string, { status: string; head: any }>();
        const priority = (s: string) =>
          s === 'MENUNGGU VERIFIKASI' ? 2 : s === 'PENDING' ? 1 : 0;

        data.forEach(d => {
          const fid    = String(d.id_keluarga ?? d.id ?? '');
          const status = String(d.status ?? '');
          if (!fid) return;
          const cur = familyMap.get(fid);
          if (!cur || priority(status) > priority(cur.status)) {
            familyMap.set(fid, { status, head: d });
          }
        });

        // First run: snapshot kondisi awal saja, JANGAN notif
        if (isFirstPendaftar.current) {
          familyMap.forEach(({ status }, fid) => {
            seenStatus.current.add(`${fid}:${status}`);
          });
          saveSet(KEY_SEEN_STATUS, seenStatus.current);
          isFirstPendaftar.current = false;
          return;
        }

        // Cek setiap keluarga: ada perubahan status yang belum pernah dinotif?
        familyMap.forEach(({ status, head }, fid) => {
          if (status !== 'MENUNGGU VERIFIKASI' && status !== 'PENDING') return;

          const key = `${fid}:${status}`;
          if (seenStatus.current.has(key)) return;

          const nama = String(head.nama_kepala_keluarga || head.nama_peserta || '–');
          const rute = String(head.rute_tujuan || '–');

          if (status === 'MENUNGGU VERIFIKASI') {
            addNotif({
              type: 'pendaftar',
              title: '🔔 Perlu Diverifikasi',
              message: `Keluarga "${nama}" (${rute}) menunggu verifikasi.`,
              link: '/admin/verifikasi',
              meta: { familyId: fid },
            });
          } else {
            addNotif({
              type: 'pendaftar',
              title: '⏳ Status PENDING',
              message: `Keluarga "${nama}" (${rute}) ada anggota berstatus PENDING.`,
              link: '/admin/verifikasi',
              meta: { familyId: fid },
            });
          }
          seenStatus.current.add(key);
        });

        saveSet(KEY_SEEN_STATUS, seenStatus.current);
      } catch { /* silent */ }
    };

    const pollFeedback = async () => {
      try {
        const data = await FeedbackAPI.getAdmin();
        if (!Array.isArray(data)) return;

        if (isFirstFeedback.current) {
          data.forEach((f: any) => seenFeedback.current.add(String(f.id)));
          saveSet(KEY_SEEN_FEEDBACK, seenFeedback.current);
          isFirstFeedback.current = false;
          return;
        }

        data.forEach((f: any) => {
          const fid = String(f.id);
          if (seenFeedback.current.has(fid)) return;
          const nama  = f.nama_pengirim || 'Anonim';
          const stars = '⭐'.repeat(Math.min(Number(f.rating) || 0, 5));
          const peek  = String(f.komentar || '').slice(0, 70);
          addNotif({
            type: 'feedback',
            title: `💬 Feedback Baru ${stars}`,
            message: `${nama}: "${peek}${(f.komentar?.length ?? 0) > 70 ? '…' : ''}"`,
            link: '/admin/feedback',
          });
          seenFeedback.current.add(fid);
        });
        saveSet(KEY_SEEN_FEEDBACK, seenFeedback.current);
      } catch { /* silent */ }
    };

    const poll = () => { pollPendaftar(); pollFeedback(); };
    const t0 = setTimeout(poll, 2000);
    const iv = setInterval(poll, POLL_INTERVAL);
    return () => { clearTimeout(t0); clearInterval(iv); };
  }, [addNotif]);
}