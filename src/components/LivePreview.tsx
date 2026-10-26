import React, { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { ExternalLink, RotateCw, X } from 'lucide-react';
import {
  CROSS_ORIGIN_SANDBOX,
  DEV_DOWN_PREVIEW_ID,
  LIVE_PREVIEWS,
  type LivePreviewTarget,
  previewById,
  previewForProject,
  sandboxFor,
  viewportAllowsEmbed,
} from '../data/livePreviews';
import { useTheme } from '../hooks/useTheme';
import { getLenis } from '../hooks/useSmoothScroll';

const LIVE_LABEL = 'Live';
const LIVE_UNAVAILABLE = 'Live unavailable';
const LIVE_UNAVAILABLE_TIP = "This app isn't reachable right now";

export const OPEN_LIVE_EVENT = 'portfolio:open-live';

export function liveAriaLabel(title: string): string {
  return `Open ${title} live`;
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--os-primary)]';

type PreviewStatus = { state: 'checking' | 'ready'; up: boolean; embeddable: boolean };

const CHECKING: PreviewStatus = { state: 'checking', up: false, embeddable: false };
const CLOSED: PreviewStatus = { state: 'ready', up: false, embeddable: false };

const statuses = new Map<string, PreviewStatus>();
const inflight = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();

let revision = 0;

function emit() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function useLiveRevision(): number {
  return useSyncExternalStore(subscribe, () => revision, () => 0);
}

export function liveActionHint(projectId: string): string {
  const target = previewForProject(projectId);
  if (!target) return LIVE_LABEL;
  const status = statuses.get(target.id);
  if (status?.state === 'ready' && !status.up) return LIVE_UNAVAILABLE;
  return LIVE_LABEL;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readStatus(id: string): PreviewStatus {
  return statuses.get(id) ?? CHECKING;
}

function knownHealthId(id: string): boolean {
  return id === DEV_DOWN_PREVIEW_ID || previewById(id) !== undefined;
}

function loadStatus(id: string) {
  if (!knownHealthId(id)) {
    statuses.set(id, CLOSED);
    emit();
    return;
  }
  if (statuses.get(id)?.state === 'ready' || inflight.has(id)) return;
  statuses.set(id, CHECKING);
  emit();
  const job = (async () => {
    try {
      const response = await fetch(`/api/health?id=${encodeURIComponent(id)}`, {
        headers: { accept: 'application/json' },
      });
      const body: unknown = await response.json();
      const up = typeof body === 'object' && body !== null && (body as { up?: unknown }).up === true;
      const embeddable =
        up && typeof body === 'object' && body !== null && (body as { embeddable?: unknown }).embeddable === true;
      statuses.set(id, { state: 'ready', up, embeddable });
    } catch {
      statuses.set(id, CLOSED);
    } finally {
      inflight.delete(id);
      emit();
    }
  })();
  inflight.set(id, job);
}

function usePreviewStatus(id: string | null): PreviewStatus {
  const status = useSyncExternalStore(
    subscribe,
    () => (id ? readStatus(id) : CLOSED),
    () => CHECKING,
  );
  useEffect(() => {
    if (id) loadStatus(id);
  }, [id]);
  return id ? status : CLOSED;
}

function subscribeViewport(onChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const queries = ['(min-width: 768px)', '(pointer: coarse)', '(any-pointer: fine)', '(max-device-width: 767px)'].map(
    (query) => window.matchMedia(query),
  );
  queries.forEach((query) => query.addEventListener('change', onChange));
  return () => queries.forEach((query) => query.removeEventListener('change', onChange));
}

function useCanEmbedFrame(): boolean {
  return useSyncExternalStore(subscribeViewport, viewportAllowsEmbed, () => false);
}

function showDevDownControl(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

const LivePreviewDialog: React.FC<{ target: LivePreviewTarget; onClose: () => void }> = ({ target, onClose }) => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const isDark = theme.mode === 'dark';
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const sandbox = sandboxFor(target);

  useEffect(() => {
    const root = dialogRef.current;
    const previously = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const lenis = getLenis();
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = () => {
      if (!root) return [];
      return [...root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), iframe')].filter(
        (el) => el.tabIndex !== -1 && el.getClientRects().length > 0,
      );
    };

    const timer = window.setTimeout(() => focusable()[0]?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !root?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      previously?.focus();
    };
  }, [onClose]);

  if (sandbox !== CROSS_ORIGIN_SANDBOX) return null;

  const reload = () => {
    setLoaded(false);
    setFrameKey((key) => key + 1);
  };

  return createPortal(
    <m.div
      role="presentation"
      className="fixed inset-0 z-[170] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.18 }}
      onMouseDown={onClose}
    >
      <m.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.2 }}
        className={`flex max-h-[90vh] w-[min(96vw,72rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl ${
          isDark ? 'border-white/10 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className={`flex items-center gap-2 border-b px-3 py-2 sm:px-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <h2 id={titleId} className="min-w-0 flex-1 truncate text-sm font-semibold">
            {target.title}
          </h2>
          <button type="button" onClick={reload} aria-label={`Reload ${target.title} live`} className={`rounded-lg p-2 ${focusRing}`}>
            <RotateCw size={16} />
          </button>
          <a
            href={target.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={liveAriaLabel(target.title)}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold ${focusRing}`}
            style={{ color: 'var(--os-primary)' }}
          >
            Open in new tab
            <ExternalLink size={14} aria-hidden />
          </a>
          <button type="button" onClick={onClose} aria-label={`Close ${target.title} live`} className={`rounded-lg p-2 ${focusRing}`}>
            <X size={16} />
          </button>
        </div>
        <div className="relative aspect-[16/10] w-full bg-slate-900/40">
          {!loaded && (
            <div className={`absolute inset-0 animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} aria-hidden />
          )}
          <iframe
            key={frameKey}
            src={target.url}
            title={`${target.title} live`}
            sandbox={sandbox}
            referrerPolicy="no-referrer"
            allow=""
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 h-full w-full border-0 bg-white"
          />
        </div>
      </m.div>
    </m.div>,
    document.body,
  );
};

const ActionBody: React.FC<{
  label: string;
  checking: boolean;
  iconSize: number;
}> = ({ label, checking, iconSize }) => (
  <>
    <ExternalLink size={iconSize} className="mr-1 shrink-0" aria-hidden />
    <span>{label}</span>
    {checking && <span className="ml-1 text-[10px] font-medium uppercase tracking-wide opacity-70">Checking</span>}
  </>
);

function requestLiveDialog(projectId: string) {
  window.dispatchEvent(new CustomEvent(OPEN_LIVE_EVENT, { detail: projectId }));
}

/** Opens the in-page preview when it is allowed, otherwise a new tab. Never an iframe when the check failed. */
export function openLive(projectId: string): 'opened' | 'blocked' | 'external' {
  const target = previewForProject(projectId);
  if (!target) return 'external';
  const status = statuses.get(target.id);
  if (!status || status.state !== 'ready' || !status.up) return 'blocked';
  const canFrame = status.embeddable && viewportAllowsEmbed() && sandboxFor(target) === CROSS_ORIGIN_SANDBOX;
  if (canFrame) {
    requestLiveDialog(projectId);
    return 'opened';
  }
  window.open(target.url, '_blank', 'noopener,noreferrer');
  return 'opened';
}

export const LiveButton: React.FC<{
  projectId: string;
  title: string;
  href: string;
  primary: string;
  iconSize?: number;
  className?: string;
  emphasize?: boolean;
}> = ({ projectId, title, href, primary, iconSize = 14, className, emphasize = false }) => {
  const target = previewForProject(projectId);
  const classes = className ?? `inline-flex items-center text-sm ${emphasize ? 'font-semibold' : ''}`;
  if (!target || target.url !== href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={liveAriaLabel(title)}
        className={`${classes} ${focusRing}`}
        style={{ color: primary }}
      >
        <ActionBody label={LIVE_LABEL} checking={false} iconSize={iconSize} />
      </a>
    );
  }
  return <PreviewControl target={target} primary={primary} iconSize={iconSize} className={classes} />;
};

const PreviewControl: React.FC<{
  target: LivePreviewTarget;
  primary: string;
  iconSize: number;
  className?: string;
}> = ({ target, primary, iconSize, className }) => {
  const status = usePreviewStatus(target.id);
  const wide = useCanEmbedFrame();
  const tipId = useId();
  const classes = className ?? 'inline-flex items-center text-sm font-semibold';
  const canFrame = status.embeddable && wide && sandboxFor(target) === CROSS_ORIGIN_SANDBOX;
  const checking = status.state === 'checking';
  const unavailable = status.state === 'ready' && !status.up;
  const aria = liveAriaLabel(target.title);

  if (unavailable) {
    return (
      <span className="group relative inline-flex">
        <button
          type="button"
          data-testid={`live-${target.projectId}`}
          className={`${classes} cursor-not-allowed opacity-50 ${focusRing}`}
          style={{ color: primary }}
          aria-disabled="true"
          aria-label={LIVE_UNAVAILABLE}
          aria-describedby={tipId}
          title={LIVE_UNAVAILABLE_TIP}
          onClick={(event) => event.preventDefault()}
        >
          <ActionBody label={LIVE_UNAVAILABLE} checking={false} iconSize={iconSize} />
        </button>
        <span
          id={tipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs text-white group-hover:block group-focus-within:block"
        >
          {LIVE_UNAVAILABLE_TIP}
        </span>
      </span>
    );
  }

  if (!checking && !canFrame) {
    return (
      <a
        href={target.url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`live-${target.projectId}`}
        aria-label={aria}
        className={`${classes} ${focusRing}`}
        style={{ color: primary }}
      >
        <ActionBody label={LIVE_LABEL} checking={false} iconSize={iconSize} />
      </a>
    );
  }

  return (
    <button
      type="button"
      data-testid={`live-${target.projectId}`}
      className={`${classes} ${focusRing}`}
      style={{ color: primary }}
      aria-label={aria}
      aria-busy={checking || undefined}
      aria-haspopup={canFrame ? 'dialog' : undefined}
      onClick={() => {
        if (checking || !canFrame) return;
        requestLiveDialog(target.projectId);
      }}
    >
      <ActionBody label={LIVE_LABEL} checking={checking} iconSize={iconSize} />
    </button>
  );
};

/** One dialog for every Live action, including the command palette. */
export const LivePreviewHost: React.FC = () => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const close = useCallback(() => setProjectId(null), []);

  useEffect(() => {
    for (const entry of LIVE_PREVIEWS) loadStatus(entry.id);
    const onOpen = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const target = typeof id === 'string' ? previewForProject(id) : undefined;
      if (!target) return;
      const status = statuses.get(target.id);
      const allowed =
        status?.embeddable === true && viewportAllowsEmbed() && sandboxFor(target) === CROSS_ORIGIN_SANDBOX;
      if (!allowed) return;
      setProjectId(target.projectId);
    };
    window.addEventListener(OPEN_LIVE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_LIVE_EVENT, onOpen);
  }, []);

  const target = projectId ? previewForProject(projectId) : undefined;
  return (
    <AnimatePresence>
      {target && sandboxFor(target) === CROSS_ORIGIN_SANDBOX && (
        <LivePreviewDialog target={target} onClose={close} />
      )}
    </AnimatePresence>
  );
};

/** Local/dev control whose health id is always down. Hidden on deployed hosts. */
export const DevUnavailablePreview: React.FC<{ primary: string }> = ({ primary }) => {
  const [visible] = useState(showDevDownControl);
  const status = usePreviewStatus(visible ? DEV_DOWN_PREVIEW_ID : null);
  if (!visible) return null;
  const checking = status.state === 'checking';
  const tipId = 'dev-down-preview-tip';
  return (
    <p className="mb-4 flex justify-center">
      <span className="group relative inline-flex">
        <button
          type="button"
          data-testid="live-dev-down"
          className={`inline-flex items-center text-sm font-semibold ${checking ? '' : 'cursor-not-allowed opacity-50'} ${focusRing}`}
          style={{ color: primary }}
          aria-label={checking ? LIVE_LABEL : LIVE_UNAVAILABLE}
          aria-disabled={checking ? undefined : true}
          aria-busy={checking || undefined}
          aria-describedby={checking ? undefined : tipId}
          title={checking ? undefined : LIVE_UNAVAILABLE_TIP}
          onClick={(event) => event.preventDefault()}
        >
          <ActionBody label={checking ? LIVE_LABEL : LIVE_UNAVAILABLE} checking={checking} iconSize={14} />
        </button>
        {!checking && (
          <span
            id={tipId}
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs text-white group-hover:block group-focus-within:block"
          >
            {LIVE_UNAVAILABLE_TIP}
          </span>
        )}
      </span>
    </p>
  );
};
