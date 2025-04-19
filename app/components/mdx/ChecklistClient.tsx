'use client';

import { ReactNode, useEffect, useRef } from "react";
import { ChecklistObserver } from "../ChecklistObserver";

export function ChecklistClient({ 
    children,
    id
}: { 
    children: ReactNode;
    id: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        
        const savedState = localStorage.getItem(`checklist-${id}`);
        if (savedState) {
            const checkedItems = JSON.parse(savedState);
            checkedItems.forEach((index: number) => {
                const li = containerRef.current?.querySelectorAll('li')[index];
                if (li) {
                    li.classList.add('checked');
                }
            });
        }
    }, [id]);

    const saveState = () => {
        if (!containerRef.current) return;
        
        const checkedItems = Array.from(containerRef.current.querySelectorAll('li'))
            .map((li, index) => li.classList.contains('checked') ? index : -1)
            .filter(index => index !== -1);
        
        localStorage.setItem(`checklist-${id}`, JSON.stringify(checkedItems));
    };

    return (
        <>
            <ChecklistObserver />
            <div 
                ref={containerRef}
                className="checklist"
                onClick={(e) => {
                    const li = (e.target as HTMLElement).closest('li');
                    if (li) {
                        const isDirectClick = e.target === li || e.target === li.querySelector('p') || e.target === li.querySelector('code');
                        if (isDirectClick) {
                            li.classList.toggle('checked');
                            saveState();
                        }
                    }
                }}
            >
                {children}
            </div>
        </>
    );
} 