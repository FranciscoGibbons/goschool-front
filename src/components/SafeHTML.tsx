"use client";

import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface SafeHTMLProps {
  html: string;
  className?: string;
}

const HAS_HTML_TAGS = /<[a-z][\s\S]*>/i;

export default function SafeHTML({ html, className }: SafeHTMLProps) {
  if (!html) return null;

  // If content has no HTML tags, render as plain text preserving whitespace
  if (!HAS_HTML_TAGS.test(html)) {
    return (
      <p className={cn("whitespace-pre-wrap", className)}>
        {html}
      </p>
    );
  }

  // Sanitize HTML with DOMPurify to prevent XSS - only allow safe formatting tags
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "del",
      "ul", "ol", "li", "a", "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1",
        "[&_li]:my-0",
        "[&_p]:my-0.5",
        "[&_a]:text-primary [&_a]:underline",
        "[&_strong]:font-bold [&_b]:font-bold",
        "[&_em]:italic [&_i]:italic",
        "[&_u]:underline",
        "[&_s]:line-through [&_del]:line-through",
        className
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
