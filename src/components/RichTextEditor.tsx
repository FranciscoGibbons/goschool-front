"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "px-2 py-1 rounded text-sm font-medium transition-colors",
        active
          ? "bg-primary text-white"
          : "text-text-secondary hover:bg-surface-muted"
      )}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If the editor only has an empty paragraph, treat as empty
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[96px] w-full px-3 py-2 text-sm text-text-primary",
          "focus:outline-none",
          "prose prose-sm max-w-none",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1",
          "[&_li]:my-0",
          "[&_p]:my-0.5",
          "[&_a]:text-primary [&_a]:underline"
        ),
      },
    },
    immediatelyRender: false,
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML() && content !== (editor.getHTML() === "<p></p>" ? "" : editor.getHTML())) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  const handleAddLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return (
      <div
        className={cn(
          "min-h-[96px] w-full rounded-md border border-border bg-surface",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-md border border-border bg-surface",
        "focus-within:border-primary transition-colors duration-150",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrita"
        >
          <span className="font-bold">B</span>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Cursiva"
        >
          <span className="italic">I</span>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Subrayado"
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Tachado"
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista con puntos"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="2.5" cy="4" r="1.5" />
            <circle cx="2.5" cy="8" r="1.5" />
            <circle cx="2.5" cy="12" r="1.5" />
            <rect x="6" y="3" width="9" height="2" rx="0.5" />
            <rect x="6" y="7" width="9" height="2" rx="0.5" />
            <rect x="6" y="11" width="9" height="2" rx="0.5" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerada"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <text x="1" y="5.5" fontSize="5" fontWeight="bold">1</text>
            <text x="1" y="9.5" fontSize="5" fontWeight="bold">2</text>
            <text x="1" y="13.5" fontSize="5" fontWeight="bold">3</text>
            <rect x="6" y="3" width="9" height="2" rx="0.5" />
            <rect x="6" y="7" width="9" height="2" rx="0.5" />
            <rect x="6" y="11" width="9" height="2" rx="0.5" />
          </svg>
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          active={editor.isActive("link")}
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkInput(!showLinkInput);
            }
          }}
          title="Enlace"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6.5 9.5a3 3 0 0 0 4.2.3l2-2a3 3 0 0 0-4.2-4.3L7.3 4.7" strokeLinecap="round" />
            <path d="M9.5 6.5a3 3 0 0 0-4.2-.3l-2 2a3 3 0 0 0 4.2 4.3l1.2-1.2" strokeLinecap="round" />
          </svg>
        </ToolbarButton>
      </div>

      {/* Link input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 border-b border-border px-2 py-1.5">
          <input
            type="url"
            placeholder="https://ejemplo.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddLink();
              }
              if (e.key === "Escape") {
                setShowLinkInput(false);
                setLinkUrl("");
              }
            }}
            className="flex-1 text-sm bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddLink}
            className="text-xs text-primary font-medium hover:underline"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl("");
            }}
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
