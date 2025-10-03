// hooks/useDropdownLogic.ts
import { useMemo, useRef, useState } from 'react';
import type { Token } from '../types';
import { useModal } from './useModal';

export function useDropdownLogic(
    tokens: Token[],
    value: string,
    onChange: (id: string) => void
) {
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { isOpen, open, close } = useModal({
        autoFocusRef: searchInputRef,
        onClose: () => setSearchTerm(''),
    });

    const selectedToken = useMemo(
        () => tokens.find((t) => t.id === value),
        [tokens, value]
    );
    const filteredTokens = useMemo(
        () =>
            tokens.filter((t) =>
                t.currency.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [tokens, searchTerm]
    );

    const handleSelect = (id: string) => {
        onChange(id);
        close();
    };

    return {
        searchTerm,
        setSearchTerm,
        searchInputRef,
        isOpen,
        open,
        close,
        selectedToken,
        filteredTokens,
        handleSelect,
    };
}
