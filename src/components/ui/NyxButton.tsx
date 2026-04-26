'use client';

import { ReactNode } from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface NyxButtonProps {
    children: ReactNode;
    icon?: LucideIcon;
    href?: string;
    onClick?: () => void;
    className?: string;
    variant?: 'primary' | 'glass' | 'outline' | 'none';
    showIconContainer?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    target?: string;
    rel?: string;
    download?: string | boolean;
    as?: 'button' | 'a' | 'div' | 'span';
}

export default function NyxButton({
    children,
    icon: Icon = ArrowUpRight,
    href,
    onClick,
    className = '',
    variant = 'primary',
    showIconContainer = true,
    disabled = false,
    type = 'button',
    target,
    rel,
    download,
    as: ComponentProp
}: NyxButtonProps) {
    const baseStyles = "flex items-center gap-4 px-3 py-3 rounded-full transition-all duration-300 group relative disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-inverse hover:opacity-90 border border-theme text-inverse pr-6",
        glass: "bg-secondary hover:bg-theme/10 backdrop-blur-md border border-theme text-theme-primary font-medium px-8 py-3",
        outline: "border border-theme hover:bg-secondary text-theme-secondary hover:text-theme-primary px-6 py-2.5",
        none: ""
    };

    const content = (
        <>
            {showIconContainer && variant === 'primary' && (
                <div className="w-9 h-9 rounded-full bg-theme flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="w-5 h-5 text-inverse" />
                </div>
            )}
            <span className={variant === 'primary' ? 'font-bold text-sm tracking-wide ml-2' : 'text-sm'}>
                {children}
            </span>
        </>
    );

    const fullClassName = `${baseStyles} ${variant !== 'none' ? variants[variant] : ''} ${className}`;

    if (ComponentProp === 'div' || ComponentProp === 'span') {
        const Component = ComponentProp;
        return (
            <Component className={fullClassName} onClick={onClick}>
                {content}
            </Component>
        );
    }

    if (href) {
        return (
            <Link 
                href={href} 
                className={fullClassName}
                target={target}
                rel={rel}
                download={download as string | undefined}
            >
                {content}
            </Link>
        );
    }

    return (
        <button 
            onClick={onClick} 
            className={fullClassName}
            disabled={disabled}
            type={type}
        >
            {content}
        </button>
    );
}
