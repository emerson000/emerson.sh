// Text logo "Emerson". Overlayed with a marker effect that makes it appear redacted.
// The redaction fades away when hovered over.

import { cn } from "@/lib/utils";
import localFont from "next/font/local";

export const logoFont = localFont({
    src: "../fonts/ModernSans.woff2",
    style: "normal",
    weight: "100",
});

export default function Logo() { 
    return (
        <div className="relative inline-block select-none">
            <span className={cn(logoFont.className, "text-2xl font-bold text-slate-700", "dark:text-slate-200")}>
                emerson
            </span>
            <div
                className={cn("absolute inset-0 bg-slate-900 opacity-100 transition-opacity duration-300", "hover:opacity-0 active:opacity-0 touch-none", "dark:bg-slate-200")}
            />
        </div>
    );
};