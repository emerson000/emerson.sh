import { ReactNode } from "react";
import { ChecklistClient } from "./ChecklistClient";

export function Checklist({ 
    children,
    id
}: { 
    children: ReactNode;
    id: string;
}) {
    return (
        <div className="checklist bg-muted dark:bg-zinc-900 px-6 rounded-2xl shadow-md border text-foreground">
            <ChecklistClient id={id}>{children}</ChecklistClient>
        </div>
    );
}