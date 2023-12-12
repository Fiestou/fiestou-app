import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";

const QuillNoSSRWrapper = dynamic(import("react-quill"), {
  ssr: false,
  loading: () => <></>,
});

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ image: true }],
    ["clean"],
    [{ size: [] }, { header: [1, 2, 3, 4, 5, 6] }, { font: [] }],
  ],
  clipboard: {
    matchVisual: false,
  },
};

interface EditorType {
  name?: string;
  onChange?: Function;
  onKeyUp?: Function;
  onBlur?: Function;
  prevent?: boolean;
  className?: string;
  id?: string;
  rows?: number | string;
  value?: string;
  placeholder?: string;
  options?: any;
  errorMessage?: string | boolean;
  required?: boolean;
  readonly?: boolean;
}

export default function Editor(attr: EditorType) {
  return (
    <>
      <div className="pb-20">
        <QuillNoSSRWrapper
          modules={modules}
          value={attr?.value}
          theme="snow"
          className="h-full"
          onChange={(e: any) => (!!attr?.onChange ? attr?.onChange(e) : {})}
        />
      </div>
      {attr?.errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {attr?.errorMessage}
        </div>
      )}
    </>
  );
}
