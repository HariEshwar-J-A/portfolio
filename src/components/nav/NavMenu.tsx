import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export interface NavMenuEntry {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  kbd?: string;
  selected?: boolean;
  onSelect: () => void;
}

export interface NavMenuGroup {
  id: string;
  label?: string;
  items: NavMenuEntry[];
}

interface NavMenuProps {
  trigger: React.ReactNode;
  triggerClassName: string;
  menuLabel: string;
  groups: NavMenuGroup[];
  kind?: 'menu' | 'listbox';
  align?: 'left' | 'right';
  panelClassName: string;
  itemClassName: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Compact dropdown. Arrow keys move, Escape closes, and focus returns
 * to the trigger. `listbox` is for the role switcher; `menu` is for actions.
 */
const NavMenu: React.FC<NavMenuProps> = ({
  trigger,
  triggerClassName,
  menuLabel,
  groups,
  kind = 'menu',
  align = 'right',
  panelClassName,
  itemClassName,
  className,
  open: controlledOpen,
  onOpenChange,
}) => {
  const reduce = useReducedMotion();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (controlledOpen === undefined) setUncontrolledOpen(next);
  };
  const flat = groups.flatMap((group) => group.items);
  const itemRole = kind === 'listbox' ? 'option' : 'menuitem';
  const panelRole = kind === 'listbox' ? 'listbox' : 'menu';

  useEffect(() => {
    if (!open) return;
    const selected = flat.findIndex((item) => item.selected);
    const index = selected >= 0 ? selected : 0;
    const focusTimer = window.setTimeout(() => itemRefs.current[index]?.focus(), 0);
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('pointerdown', onPointerDown);
    };
    // Only when the panel opens. Item identity is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const closeAndFocusTrigger = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const move = (index: number) => {
    const count = flat.length;
    if (!count) return;
    const next = (index + count) % count;
    itemRefs.current[next]?.focus();
  };

  const onPanelKeyDown = (event: React.KeyboardEvent) => {
    const current = itemRefs.current.findIndex((node) => node === document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(current + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(current <= 0 ? flat.length - 1 : current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      move(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      move(flat.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeAndFocusTrigger();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  let itemIndex = -1;

  return (
    <div ref={rootRef} className={className ? `relative ${className}` : 'relative'}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-haspopup={kind === 'listbox' ? 'listbox' : 'menu'}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role={panelRole}
            aria-label={menuLabel}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0.01 : 0.16, ease: 'easeOut' }}
            onKeyDown={onPanelKeyDown}
            className={`absolute top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${
              align === 'right' ? 'right-0' : 'left-0'
            } ${panelClassName}`}
          >
            {groups.map((group) => (
              <div key={group.id} className="border-b border-slate-500/15 p-1.5 last:border-b-0">
                {group.label && (
                  <p className="px-3 pb-1 pt-2 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    {group.label}
                  </p>
                )}
                {group.items.map((item) => {
                  itemIndex += 1;
                  const index = itemIndex;
                  return (
                    <button
                      key={item.id}
                      ref={(node) => {
                        itemRefs.current[index] = node;
                      }}
                      type="button"
                      role={itemRole}
                      aria-selected={kind === 'listbox' ? Boolean(item.selected) : undefined}
                      aria-current={kind === 'menu' && item.selected ? 'true' : undefined}
                      tabIndex={-1}
                      onClick={() => {
                        setOpen(false);
                        item.onSelect();
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--os-primary)] ${itemClassName}`}
                      style={
                        item.selected
                          ? {
                              color: 'var(--os-primary)',
                              backgroundColor: 'color-mix(in srgb, var(--os-primary) 12%, transparent)',
                            }
                          : undefined
                      }
                    >
                      {item.icon && (
                        <span className="shrink-0" style={{ color: 'var(--os-primary)' }}>
                          {item.icon}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        {item.label}
                        {item.description && (
                          <span className="mt-0.5 block text-[11px] font-normal text-slate-400">
                            {item.description}
                          </span>
                        )}
                      </span>
                      {item.kbd && (
                        <kbd className="font-mono text-[10px] text-slate-400">{item.kbd}</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavMenu;
