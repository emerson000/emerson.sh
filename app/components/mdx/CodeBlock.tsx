import { ReactNode } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

interface MDXProps {
    props: {
        children?: string;
    };
}

export function CodeBlock({ children, language = "javascript" }: { children: ReactNode; language?: string }) {
    // Extract the actual code content from children
    let codeContent = "";
    if (typeof children === "string") {
        codeContent = children.trim();
    } else if (Array.isArray(children)) {
        codeContent = children.map(child => 
            typeof child === "string" ? child : ""
        ).join("").trim();
    } else if (children && typeof children === "object" && "props" in children) {
        // Handle MDX content
        const mdxContent = children as MDXProps;
        codeContent = mdxContent.props.children || "";
    }
    
    // Highlight the code
    const highlighted = hljs.highlight(codeContent, {
        language: language,
        ignoreIllegals: true
    }).value;

    return (
        <pre className={`hljs rounded-md p-4 my-4 overflow-x-auto bg-gray-100 dark:bg-gray-800`}>
            <code 
                className={`hljs language-${language} font-mono text-sm`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
            />
        </pre>
    );
}