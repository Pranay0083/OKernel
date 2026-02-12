import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', hover = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`bg-card text-card-foreground border border-border rounded-lg shadow-sm ${hover ? 'hover:border-zinc-700 transition-colors' : ''} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
