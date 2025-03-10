"use client";

import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button"; // or any button you want

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * A Rich Text Editor using Tiptap with bold, italic, and list capabilities.
 * You can customize the toolbar as desired.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Compose something amazing...",
  className,
}: RichTextEditorProps) {
  // Initialize our Tiptap editor instance
  const editor = useEditor({
    extensions: [StarterKit.configure({})],
    content: value,
    onUpdate: ({ editor: updatedEditor }) => {
      const html = updatedEditor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg focus:outline-none p-4 rounded border border-gray-200 min-h-[200px] ${className || ""}`,
      },
    },
  });

  if (!editor) {
    return null;
  }

  // Toolbar Actions
  const handleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const handleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const handleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  const handleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  return (
    <div className="space-y-2">
      {/* Simple toolbar */}
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          onClick={handleBold}
          variant={editor.isActive("bold") ? "default" : "outline"}
        >
          B
        </Button>
        <Button
          type="button"
          onClick={handleItalic}
          variant={editor.isActive("italic") ? "default" : "outline"}
        >
          I
        </Button>
        <Button
          type="button"
          onClick={handleBulletList}
          variant={editor.isActive("bulletList") ? "default" : "outline"}
        >
          • List
        </Button>
        <Button
          type="button"
          onClick={handleOrderedList}
          variant={editor.isActive("orderedList") ? "default" : "outline"}
        >
          1. List
        </Button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}