"use client";

import { AnimatePresence, m } from "framer-motion";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Action row (buttons). */
  actions?: ReactNode;
  closeLabel: string;
};

/**
 * Bottom sheet on phones, centred modal on larger screens. Traps focus in a
 * lightweight way (Tab cycles within the panel), closes on Escape/backdrop,
 * locks background scroll while open, and restores focus afterwards.
 */
export function Dialog({ open, onClose, title, description, children, actions, closeLabel }: DialogProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    // Move focus into the panel on the next frame (after the portal mounts).
    // Prefer an element marked data-autofocus (the safe/cancel action).
    const raf = requestAnimationFrame(() => {
      const list = focusables();
      const preferred = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]");
      (preferred ?? list[0] ?? panelRef.current)?.focus();
    });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab") {
        const list = focusables();
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <m.button
            type="button"
            aria-label={closeLabel}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            aria-describedby={description ? `${id}-desc` : undefined}
            tabIndex={-1}
            className={cn(
              "surface-card relative z-10 w-full max-w-md rounded-t-xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none sm:rounded-xl sm:p-6",
            )}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border-strong sm:hidden" aria-hidden />
            <h2 id={`${id}-title`} className="text-lg font-bold text-fg">
              {title}
            </h2>
            {description && (
              <p id={`${id}-desc`} className="mt-1.5 text-sm text-muted text-pretty">
                {description}
              </p>
            )}
            {children}
            {actions && <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">{actions}</div>}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
