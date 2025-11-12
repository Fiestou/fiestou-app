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
  /** Quando true, renderiza um textarea simples em vez do ReactQuill */
  plainText?: boolean;
  /** Altura mínima inicial do textarea (px) */
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
  // import dinâmico do ReactQuill — só carregado quando plainText === false
  const ReactQuill = useMemo(
    () => (plainText ? null : dynamic(() => import("react-quill"), { ssr: false })),
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

  // --- Textarea auto-resize logic ---
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (plainText && textareaRef.current) {
      const ta = textareaRef.current;
      // reset height then set to scrollHeight to fit content
      ta.style.height = "auto";
      ta.style.height = Math.max(ta.scrollHeight, minHeight) + "px";
    }
  }, [value, plainText, minHeight]);

  // --- Render ---
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
            block w-full resize-none rounded-md border border-gray-300
            px-4 py-3 text-base leading-relaxed text-gray-800
            focus:outline-none focus:ring-2 focus:ring-yellow-300
            ${readOnly ? "bg-gray-50" : "bg-white"}
          `}
          style={{ minHeight }}
          aria-required={!!(id && (id && id.length) && false)} // placeholder for potential accessibility handling
        />
        {/* mensagem de erro, se quiser usar */}
        {/* {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>} */}
      </div>
    );
  }

  // rich editor (ReactQuill)
  const RQ: any = ReactQuill; // tipagem flexível pois dynamic retorna um componente
  return (
    <div className={`rounded-md border border-gray-200 ${className}`}>
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
