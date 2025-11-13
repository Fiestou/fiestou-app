"use client";

import { useMemo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

interface EditorProps {
  name?: string;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  required?: boolean;
  errorMessage?: string;
  plainText?: boolean;
  minHeight?: number;
}

export default function Editor({
  value = "",
  onChange,
  placeholder = "Escreva seu conteúdo...",
  className = "",
  readOnly = false,
  plainText = false,
  minHeight = 120,
  id,
}: EditorProps) {
  const ReactQuill = useMemo(
    () =>
      plainText ? null : dynamic(() => import("react-quill"), { ssr: false }),
    [plainText]
  );

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "video"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "link",
      "image",
      "video",
    ],
    []
  );

  const handleChange = useCallback(
    (val: string) => {
      onChange?.(val);
    },
    [onChange]
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (plainText && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = "auto";
      ta.style.height = Math.max(ta.scrollHeight, minHeight) + "px";
    }
  }, [value, plainText, minHeight]);

  // --- Modo simples (textarea) ---
  if (plainText) {
    return (
      <div className={`w-full ${className}`}>
        <textarea
          id={id}
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`
            block w-full resize-none rounded-md border border-zinc-300 px-4 py-3
            font-sans text-base leading-relaxed text-zinc-900
            placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-300
            ${readOnly ? "bg-zinc-50 opacity-70" : "bg-white"}
          `}
          style={{ minHeight }}
        />
      </div>
    );
  }

  // --- Modo rico (ReactQuill) ---
  const RQ: any = ReactQuill;
  return (
    <div
      className={`
        quill-textarea
        rounded-md border border-zinc-300
        font-sans text-base leading-relaxed text-zinc-900
        ${className}
        ${readOnly ? "opacity-70 bg-zinc-50" : "bg-white"}
      `}
    >
      <RQ
        theme="snow"
        modules={modules}
        formats={formats}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}
