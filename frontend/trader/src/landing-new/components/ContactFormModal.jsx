'use client'

import { useEffect, useState } from 'react';
import { X, Send, Mail, CheckCircle2 } from 'lucide-react';

const SUPPORT_EMAIL = 'support@bull4x.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Reusable contact modal — opens from any "Talk to expert" / "Get in touch" CTA.
 * Posts to the same /api/contact endpoint Contact.jsx uses, so submissions land
 * in the support inbox via Hostinger SMTP.
 *
 * Props:
 *  isOpen    — boolean
 *  onClose   — () => void
 *  title     — modal heading (default: "Get in touch")
 *  subject   — pre-fills the subject field
 */
export default function ContactFormModal({
  isOpen,
  onClose,
  title = 'Get in touch',
  subject: presetSubject = '',
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: presetSubject,
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form whenever modal is re-opened with a (possibly new) subject
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', subject: presetSubject, message: '' });
      setSubmitted(false);
      setErrorMsg('');
      setSending(false);
    }
  }, [isOpen, presetSubject]);

  // ESC to close + lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in your name, email and message.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setErrorMsg(
          data.error ||
            `Could not send message (HTTP ${res.status}). Email us directly at ${SUPPORT_EMAIL}.`
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setErrorMsg(`Network error. Email us directly at ${SUPPORT_EMAIL}.`);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Brand gradient strip on top */}
        <div
          className="h-1.5 w-full"
          style={{
            background:
              'linear-gradient(90deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)',
          }}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-[#6B7080] hover:bg-[#F0F2F8] hover:text-[#0D0F1A] transition-all z-10"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          {!submitted ? (
            <>
              <div className="mb-5">
                <h3
                  id="contact-modal-title"
                  className="text-xl sm:text-2xl font-extrabold text-[#0D0F1A] font-manrope mb-1"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {title}
                </h3>
                <p className="text-sm text-[#6B7080]">
                  Tell us a bit about you and we'll reply within 2 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] text-sm text-[#0D0F1A] placeholder-[#9AA0B4] focus:border-[#0158c6] focus:outline-none focus:ring-2 focus:ring-[rgba(1,88,198,0.12)] transition-all"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] text-sm text-[#0D0F1A] placeholder-[#9AA0B4] focus:border-[#0158c6] focus:outline-none focus:ring-2 focus:ring-[rgba(1,88,198,0.12)] transition-all"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] text-sm text-[#0D0F1A] placeholder-[#9AA0B4] focus:border-[#0158c6] focus:outline-none focus:ring-2 focus:ring-[rgba(1,88,198,0.12)] transition-all"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] text-sm text-[#0D0F1A] placeholder-[#9AA0B4] focus:border-[#0158c6] focus:outline-none focus:ring-2 focus:ring-[rgba(1,88,198,0.12)] transition-all resize-none"
                    required
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500 leading-relaxed">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                  style={{
                    background:
                      'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)',
                  }}
                >
                  {sending ? (
                    'Sending…'
                  ) : (
                    <>
                      Send Message <Send size={14} />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-[#9AA0B4] pt-1">
                  Or email us directly at{' '}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-[#0158c6] font-semibold hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div
                className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(77,190,81,0.14)' }}
              >
                <CheckCircle2 size={28} style={{ color: '#4dbe51' }} />
              </div>
              <h3 className="text-xl font-extrabold text-[#0D0F1A] font-manrope mb-2">
                Message sent!
              </h3>
              <p className="text-sm text-[#6B7080] mb-5">
                Thanks for reaching out. We'll reply to your email within 2 hours.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D0F1A] text-white text-sm font-semibold hover:-translate-y-0.5 transition-all"
              >
                <Mail size={14} /> Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
