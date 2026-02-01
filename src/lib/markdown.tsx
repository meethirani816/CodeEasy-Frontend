import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

/**
 * Strips leading markdown headings from content to avoid duplication
 * when the UI already displays a heading (e.g., "Introduction", "Instructions")
 */
export function stripMarkdownHeading(
  markdown: string | undefined,
  headingText: string
): string {
  if (!markdown) return '';
  
  // Match heading at the start: # Introduction, ## Instructions, etc.
  const headingPattern = new RegExp(
    `^#{1,6}\\s*${headingText}\\s*\\n?`,
    'i'
  );
  
  return markdown.replace(headingPattern, '').trim();
}

/**
 * Cleans markdown by removing both Introduction and Instructions headings
 */
export function cleanExerciseMarkdown(markdown: string | undefined): string {
  if (!markdown) return '';
  
  let cleaned = markdown;
  cleaned = stripMarkdownHeading(cleaned, 'Introduction');
  cleaned = stripMarkdownHeading(cleaned, 'Instructions');
  
  return cleaned.trim();
}

/**
 * Converts markdown concept reference links into internal app routes.
 * Exercism-style refs like `[Objects][concept-objects]` should navigate to the
 * concept lesson page, not an exercise.
 */
export function processConceptLinks(
  markdown: string | undefined,
  trackSlug: string
): string {
  if (!markdown) return '';

  let processed = markdown;

  // Handle [text][concept-slug] style reference links
  processed = processed.replace(
    /\[([^\]]+)\]\[([a-z0-9-]+)\]/gi,
    (match, text, slug) => {
      // Treat any reference that looks like a concept ref as a concept lesson link.
      if (slug.startsWith('concept-') || slug.includes('concept')) {
        const cleanSlug = slug.replace(/^concept-/, '');
        return `[${text}](/tracks/${trackSlug}/concepts/${cleanSlug})`;
      }
      return match;
    }
  );

  return processed;
}

/**
 * Custom markdown components for Exercism-like rendering
 * - Links open in new tab for external, use router for internal
 * - Code blocks have proper styling
 * - Inline code is styled with purple background
 */
export const markdownComponents = {
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    // Check if it's an internal link
    const isInternal = href?.startsWith('/') || href?.startsWith('#');
    
    if (isInternal && href) {
      return (
        <Link
          to={href}
          className="text-primary font-medium hover:underline"
          {...props}
        >
          {children}
        </Link>
      );
    }
    
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline font-medium"
        {...props}
      >
        {children}
      </a>
    );
  },
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-[#1e1e1e] text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono"
      {...props}
    >
      {children}
    </pre>
  ),
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground flex items-center gap-2" {...props}>
      <span className="text-primary">##</span> {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-semibold mt-5 mb-2 text-foreground" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-relaxed text-muted-foreground break-words" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-4 space-y-2" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed text-muted-foreground" {...props}>{children}</li>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4 bg-primary/5 py-2 rounded-r"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-border rounded-lg overflow-hidden" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border border-border px-4 py-2 bg-muted font-semibold text-left text-foreground" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-border px-4 py-2 text-muted-foreground" {...props}>{children}</td>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props}>{children}</strong>
  ),
  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...props}>{children}</em>
  ),
};

/**
 * Dark theme markdown components for code editor
 */
export const darkMarkdownComponents = {
  ...markdownComponents,
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isInternal = href?.startsWith('/') || href?.startsWith('#');
    
    if (isInternal && href) {
      return (
        <Link
          to={href}
          className="text-purple-400 hover:underline font-medium"
          {...props}
        >
          {children}
        </Link>
      );
    }
    
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-400 hover:underline font-medium"
        {...props}
      >
        {children}
      </a>
    );
  },
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-[#1a1a1a] text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono border border-[#333]"
      {...props}
    >
      {children}
    </pre>
  ),
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-bold mt-6 mb-4 text-white" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-semibold mt-6 mb-3 text-white flex items-center gap-2" {...props}>
      <span className="text-purple-400">##</span> {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-semibold mt-5 mb-2 text-white" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-relaxed text-gray-300 break-words" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-300" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-300" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed text-gray-300" {...props}>{children}</li>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-4 bg-purple-500/10 py-2 rounded-r"
      {...props}
    >
      {children}
    </blockquote>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-white" {...props}>{children}</strong>
  ),
};

interface StyledMarkdownProps {
  children: string;
  dark?: boolean;
  className?: string;
  trackSlug?: string;
}

/**
 * Styled Markdown component with proper link and code rendering
 */
export const StyledMarkdown: React.FC<StyledMarkdownProps> = ({ 
  children, 
  dark = false,
  className = '',
  trackSlug = ''
}) => {
  // Process concept links if trackSlug is provided
  const processedContent = trackSlug 
    ? processConceptLinks(children, trackSlug) 
    : children;
    
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={dark ? darkMarkdownComponents : markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default StyledMarkdown;