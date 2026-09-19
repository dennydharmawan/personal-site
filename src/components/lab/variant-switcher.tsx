import { useEffect, useState } from 'react';

import { labSections } from '@/components/lab/registry';
import { RevealedContext } from '@/components/sections/shared';

type Selection = { section: string | null; variant: string | null };

function readSelection(): Selection {
  const params = new URLSearchParams(window.location.search);
  return { section: params.get('section'), variant: params.get('v') };
}

const pillClassName =
  'inline-flex min-h-9 items-center rounded-full px-3 text-sm font-medium outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-sky-300';

export default function VariantSwitcher() {
  const [selection, setSelection] = useState<Selection>(readSelection);

  useEffect(() => {
    const onPopState = () => setSelection(readSelection());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const select = (section: string, variant: string) => {
    const params = new URLSearchParams({ section, v: variant });
    window.history.pushState(null, '', `?${params}`);
    setSelection({ section, variant });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLSelectElement) return;
      const current = readSelection();
      const entry = labSections.find((item) => item.section === current.section) ?? labSections[0];
      const variant = entry.variants[Number(event.key) - 1];
      if (variant) select(entry.section, variant.id);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const activeSection =
    selection.section === null
      ? labSections[0]
      : labSections.find((entry) => entry.section === selection.section);

  if (!activeSection) {
    return (
      <div className="grid min-h-screen place-content-center gap-4 bg-white p-8 text-zinc-900">
        <p className="text-base text-zinc-600">
          No lab section named <code>{selection.section}</code>. Pick one.
        </p>
        <div className="flex flex-wrap gap-2">
          {labSections.map((entry) => (
            <button
              key={entry.section}
              type="button"
              className={`${pillClassName} bg-zinc-100 text-zinc-900 hover:bg-zinc-200`}
              onClick={() => select(entry.section, entry.variants[0].id)}
            >
              {entry.section}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const activeVariant =
    activeSection.variants.find((variant) => variant.id === selection.variant) ??
    activeSection.variants[0];
  const ActiveComponent = activeVariant.Component;

  return (
    <div className="min-h-screen overflow-x-clip bg-white pb-24 text-zinc-900">
      <RevealedContext value={true}>
        <ActiveComponent key={`${activeSection.section}:${activeVariant.id}`} />
      </RevealedContext>

      <p className="fixed left-4 top-4 z-50 rounded-full bg-zinc-900 px-3 py-1 font-mono text-xs text-white shadow-lg">
        {activeSection.section} / {activeVariant.id}
      </p>

      <nav
        aria-label="Lab variants"
        className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1 rounded-3xl bg-zinc-900 p-1.5 shadow-lg"
      >
        <select
          aria-label="Section"
          className={`${pillClassName} bg-zinc-800 text-white`}
          value={activeSection.section}
          onChange={(event) => {
            const next = labSections.find((entry) => entry.section === event.target.value);
            if (next) select(next.section, next.variants[0].id);
          }}
        >
          {labSections.map((entry) => (
            <option key={entry.section} value={entry.section}>
              {entry.section}
            </option>
          ))}
        </select>
        {activeSection.variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            aria-pressed={variant.id === activeVariant.id}
            className={`${pillClassName} ${
              variant.id === activeVariant.id
                ? 'bg-white text-zinc-900'
                : 'text-zinc-300 hover:text-white'
            }`}
            onClick={() => select(activeSection.section, variant.id)}
          >
            {variant.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
