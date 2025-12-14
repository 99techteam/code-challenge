import { useState, useRef, useEffect, type FC, type ReactNode } from 'react';

interface PopoverProps {
    trigger: ReactNode;
    content: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const Popover: FC<PopoverProps> = ({ trigger, content, open: controlledOpen, onOpenChange }) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                triggerRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, setIsOpen]);

    return (
        <div className="relative inline-block">
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer"
            >
                {trigger}
            </div>

            {isOpen && (
                <div
                    ref={popoverRef}
                    className="absolute z-50 mt-2 right-0 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 min-w-[200px] animate-fade-in"
                    style={{ top: '100%' }}
                >
                    {content}
                </div>
            )}
        </div>
    );
};
