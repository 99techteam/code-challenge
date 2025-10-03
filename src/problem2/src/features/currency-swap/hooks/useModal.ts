import { useCallback, useEffect, useRef, useState } from 'react';

interface UseModalOptions {
    /** When modal opens, automatically focus on this element (if any) */
    autoFocusRef?: React.RefObject<HTMLElement | null>;
    /** Callback when modal closes */
    onClose?: () => void;
}

export function useModal({ autoFocusRef, onClose }: UseModalOptions = {}) {
    const [isOpen, setIsOpen] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => {
        setIsOpen(false);
        onClose?.();
    }, [onClose]); // useCallback prevent unnecessary re-renders

    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                close();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);

            if (autoFocusRef?.current) {
                setTimeout(() => autoFocusRef.current?.focus(), 100);
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, close, autoFocusRef]);

    return { isOpen, open, close, toggle, modalRef };
}
