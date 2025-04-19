import { ReactNode } from "react";

export function Anchor({ children, href }: { children: ReactNode; href: string }) {
    return <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>;
}