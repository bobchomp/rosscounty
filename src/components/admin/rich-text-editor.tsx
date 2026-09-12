"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import { createClient } from "@/lib/supabase/client";

const toolbarButtonClass =
  "rounded px-2 py-1 text-sm font-medium text-neutral-600 hover:bg-neutral-100 aria-[pressed=true]:bg-club-navy/10 aria-[pressed=true]:text-club-navy";

async function uploadImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("news-images").upload(path, file);
  if (error) throw new Error(error.message);

  return supabase.storage.from("news-images").getPublicUrl(path).data.publicUrl;
}

function Toolbar({ editor, onInsertImage }: { editor: Editor; onInsertImage: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50 p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-pressed={editor.isActive("bold")}
        className={toolbarButtonClass}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-pressed={editor.isActive("italic")}
        className={toolbarButtonClass}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-pressed={editor.isActive("heading", { level: 2 })}
        className={toolbarButtonClass}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-pressed={editor.isActive("heading", { level: 3 })}
        className={toolbarButtonClass}
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-pressed={editor.isActive("bulletList")}
        className={toolbarButtonClass}
      >
        Bullet list
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-pressed={editor.isActive("orderedList")}
        className={toolbarButtonClass}
      >
        Numbered list
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-pressed={editor.isActive("blockquote")}
        className={toolbarButtonClass}
      >
        Quote
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("Link URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        aria-pressed={editor.isActive("link")}
        className={toolbarButtonClass}
      >
        Link
      </button>
      <button type="button" onClick={onInsertImage} className={toolbarButtonClass}>
        Image
      </button>
      <div className="mx-1 h-5 w-px bg-neutral-300" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className={toolbarButtonClass}
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className={toolbarButtonClass}
      >
        Redo
      </button>
    </div>
  );
}

export function RichTextEditor({
  name,
  initialContent = "",
}: {
  name: string;
  initialContent?: string;
}) {
  const [html, setHtml] = useState(initialContent);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapImage,
      TiptapLink.configure({ openOnClick: false }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[240px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-md border border-neutral-300 focus-within:border-club-navy">
      {editor && <Toolbar editor={editor} onInsertImage={() => fileInputRef.current?.click()} />}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {uploading && (
        <p className="border-b border-neutral-200 bg-amber-50 px-4 py-1.5 text-xs text-amber-800">
          Uploading image…
        </p>
      )}
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
