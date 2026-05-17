import { Fragment, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import type { Token } from "../types";
import { TokenIcon } from "./TokenIcon";
import { formatUsd } from "../lib/tokens";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  selected: Token | null;
  exclude?: Token | null;
  onSelect: (token: Token) => void;
};

export function TokenPicker({
  isOpen,
  onClose,
  tokens,
  selected,
  exclude,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = tokens
    .filter((t) => !exclude || t.symbol !== exclude.symbol)
    .filter((t) => t.symbol.toLowerCase().includes(query.toLowerCase()));

  function handleClose() {
    setQuery("");
    onClose();
  }

  function handleSelect(t: Token | null) {
    if (!t) return;
    onSelect(t);
    handleClose();
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <TransitionChild
            as={Fragment}
            enter="transition duration-200"
            enterFrom="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="transition duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              className="
                w-full sm:max-w-md max-h-[85vh] sm:max-h-[70vh]
                flex flex-col overflow-hidden
                rounded-t-3xl sm:rounded-3xl
                border border-border-card bg-[#0f1124]
                shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]
              "
            >
              <Combobox value={selected} onChange={handleSelect}>
                <div className="px-4 pt-5 pb-3 border-b border-border-card">
                  <h2 className="text-base font-semibold mb-3">Select a token</h2>
                  <ComboboxInput
                    autoFocus
                    placeholder="Search symbol"
                    onChange={(e) => setQuery(e.target.value)}
                    displayValue={() => query}
                    className="
                      focus-ring w-full rounded-2xl border border-border-card
                      bg-surface-input px-4 py-3 text-ink-primary
                      placeholder:text-ink-muted
                    "
                  />
                </div>
                <ComboboxOptions
                  static
                  className="flex-1 overflow-y-auto py-2"
                >
                  {filtered.length === 0 && (
                    <div className="px-4 py-8 text-center text-ink-muted">
                      No tokens match "{query}"
                    </div>
                  )}
                  {filtered.map((token) => (
                    <ComboboxOption
                      key={token.symbol}
                      value={token}
                      className="cursor-pointer"
                    >
                      {({ focus, selected: isSelected }) => (
                        <div
                          className={`
                            flex items-center justify-between gap-3 px-4 py-3
                            ${focus ? "bg-white/5" : ""}
                          `}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <TokenIcon symbol={token.symbol} src={token.iconUrl} />
                            <div className="min-w-0">
                              <div className="text-ink-primary font-medium truncate">
                                {token.symbol}
                              </div>
                              <div className="text-xs text-ink-muted">
                                {formatUsd(token.price)}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-success text-sm">✓</span>
                          )}
                        </div>
                      )}
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </Combobox>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
