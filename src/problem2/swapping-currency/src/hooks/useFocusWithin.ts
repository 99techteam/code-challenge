import { useRef, useCallback } from "react";

// Types
import type { FocusEvent } from "react";
import { useSyntheticBlurEvent } from "./useSynctheticBlurEvent";

export interface FocusWithinProps {
  /** Whether the focus within events should be disabled. */
  isDisabled?: boolean;
  /** Handler that is called when the target element or a descendant receives focus. */
  onFocusWithin?: (e: FocusEvent) => void;
  /** Handler that is called when the target element and all descendants lose focus. */
  onBlurWithin?: (e: FocusEvent) => void;
  /** Handler that is called when the the focus within state changes. */
  onFocusWithinChange?: (isFocusWithin: boolean) => void;
}

export interface FocusWithinResult {
  /** Props to spread onto the target element. */
  focusWithinProps: {
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
  };
}

/**
 * Handles focus events for the target and its descendants.
 */
export function useFocusWithin(props: FocusWithinProps): FocusWithinResult {
  const { isDisabled, onBlurWithin, onFocusWithin, onFocusWithinChange } =
    props;
  const state = useRef({
    isFocusWithin: false,
  });

  const onBlur = useCallback(
    (e: FocusEvent) => {
      // We don't want to trigger onBlurWithin and then immediately onFocusWithin again
      // when moving focus inside the element. Only trigger if the currentTarget doesn't
      // include the relatedTarget (where focus is moving).
      if (
        state.current.isFocusWithin &&
        !(e.currentTarget as Element).contains(e.relatedTarget as Element)
      ) {
        state.current.isFocusWithin = false;

        if (onBlurWithin) {
          onBlurWithin(e);
        }

        if (onFocusWithinChange) {
          onFocusWithinChange(false);
        }
      }
    },
    [onBlurWithin, onFocusWithinChange, state]
  );

  const onSyntheticFocus = useSyntheticBlurEvent(onBlur);
  const onFocus = useCallback(
    (e: FocusEvent) => {
      // Double check that document.activeElement actually matches e.target in case a previously chained
      // focus handler already moved focus somewhere else.
      if (!state.current.isFocusWithin && document.activeElement === e.target) {
        if (onFocusWithin) {
          onFocusWithin(e);
        }

        if (onFocusWithinChange) {
          onFocusWithinChange(true);
        }

        state.current.isFocusWithin = true;
        onSyntheticFocus(e);
      }
    },
    [onFocusWithin, onFocusWithinChange, onSyntheticFocus]
  );

  if (isDisabled) {
    return {
      focusWithinProps: {
        // These should not have been null, that would conflict in mergeProps
        onFocus: undefined,
        onBlur: undefined,
      },
    };
  }

  return {
    focusWithinProps: {
      onFocus,
      onBlur,
    },
  };
}
