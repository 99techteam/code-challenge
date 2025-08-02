import { useCallback, useLayoutEffect, useRef } from "react";

// Types
import type { FocusEvent as ReactFocusEvent } from "react";

export class SyntheticFocusEvent<Target = Element>
  implements ReactFocusEvent<Target>
{
  nativeEvent: FocusEvent;
  target: EventTarget & Target;
  currentTarget: EventTarget & Target;
  relatedTarget: Element;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  timeStamp: number;
  type: string;

  constructor(type: string, nativeEvent: FocusEvent) {
    this.nativeEvent = nativeEvent;
    this.target = nativeEvent.target as EventTarget & Target;
    this.currentTarget = nativeEvent.currentTarget as EventTarget & Target;
    this.relatedTarget = nativeEvent.relatedTarget as Element;
    this.bubbles = nativeEvent.bubbles;
    this.cancelable = nativeEvent.cancelable;
    this.defaultPrevented = nativeEvent.defaultPrevented;
    this.eventPhase = nativeEvent.eventPhase;
    this.isTrusted = nativeEvent.isTrusted;
    this.timeStamp = nativeEvent.timeStamp;
    this.type = type;
  }

  isDefaultPrevented(): boolean {
    return this.nativeEvent.defaultPrevented;
  }

  preventDefault(): void {
    this.defaultPrevented = true;
    this.nativeEvent.preventDefault();
  }

  stopPropagation(): void {
    this.nativeEvent.stopPropagation();
    this.isPropagationStopped = () => true;
  }

  isPropagationStopped(): boolean {
    return false;
  }

  persist() {}
}

export function useSyntheticBlurEvent<Target = Element>(
  onBlur: (e: ReactFocusEvent<Target>) => void
) {
  const stateRef = useRef({
    isFocused: false,
    observer: null as MutationObserver | null,
  });

  // Clean up MutationObserver on unmount. See below.

  useLayoutEffect(() => {
    const state = stateRef.current;
    return () => {
      if (state.observer) {
        state.observer.disconnect();
        state.observer = null;
      }
    };
  }, []);

  // This function is called during a React onFocus event.
  return useCallback(
    (e: ReactFocusEvent<Target>) => {
      // React does not fire onBlur when an element is disabled. https://github.com/facebook/react/issues/9142
      // Most browsers fire a native focusout event in this case, except for Firefox. In that case, we use a
      // MutationObserver to watch for the disabled attribute, and dispatch these events ourselves.
      // For browsers that do, focusout fires before the MutationObserver, so onBlur should not fire twice.
      if (
        e.target instanceof HTMLButtonElement ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        stateRef.current.isFocused = true;

        const target = e.target;
        const onBlurHandler: EventListenerOrEventListenerObject | null = (
          event: FocusEvent
        ) => {
          stateRef.current.isFocused = false;

          if (target.disabled) {
            // For backward compatibility, dispatch a (fake) React synthetic event.
            onBlur?.(new SyntheticFocusEvent("blur", event));
          }

          // We no longer need the MutationObserver once the target is blurred.
          if (stateRef.current.observer) {
            stateRef.current.observer.disconnect();
            stateRef.current.observer = null;
          }
        };

        target.addEventListener("focusout", onBlurHandler, { once: true });

        stateRef.current.observer = new MutationObserver(() => {
          if (stateRef.current.isFocused && target.disabled) {
            stateRef.current.observer?.disconnect();
            const relatedTargetEl =
              target === document.activeElement ? null : document.activeElement;
            target.dispatchEvent(
              new FocusEvent("blur", { relatedTarget: relatedTargetEl })
            );
            target.dispatchEvent(
              new FocusEvent("focusout", {
                bubbles: true,
                relatedTarget: relatedTargetEl,
              })
            );
          }
        });

        stateRef.current.observer.observe(target, {
          attributes: true,
          attributeFilter: ["disabled"],
        });
      }
    },
    [onBlur]
  );
}
