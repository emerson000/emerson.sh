import { ReactNode } from "react";

export function CodeBlock({ children, language = "javascript" }: { children: ReactNode; language?: string }) {
    return (
        <pre className={`language-${language} rounded-md p-4 my-4 overflow-x-auto bg-gray-100 dark:bg-gray-800`}>
            <code className={`language-${language} font-mono text-sm`}>
                {children}
            </code>
        </pre>
    );
}