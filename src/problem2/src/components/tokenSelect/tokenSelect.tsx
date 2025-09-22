import { useEffect, useRef, useState } from "react";
import type { Token } from "../../store/token/tokenState";
import "./tokenSelect.css";

interface Props {
    value: Token;
    onChange: (value: Token) => void;
    tokens: Token[];
}

export const TokenSelect = ({ value, onChange, tokens }: Props) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Detect clicks outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="token-select" ref={wrapperRef}>
            {/* Selected token */}
            <div className="token-select__control" onClick={() => setOpen(!open)}>
                <span className="token-select__value">
                    <img src={value.icon} alt={value.name} className="token-select__icon" />
                    {value.name}
                </span>
                <span className="token-select__arrow">{open ? "▲" : "▼"}</span>
            </div>

            {/* Dropdown */}
            {open && (
                <ul className="token-select__menu">
                    {tokens.map((token) => (
                        <li
                            key={token.name}
                            className="token-select__option"
                            onClick={() => {
                                onChange(token);
                                setOpen(false);
                            }}
                        >
                            <img src={token.icon} alt={token.name} className="token-select__icon" />
                            {token.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};