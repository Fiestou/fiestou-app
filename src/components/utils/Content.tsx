import React, { ReactNode, HTMLAttributes } from "react";

interface CustomComponentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Content<Props extends CustomComponentProps>({
  children,
  ...props
}: Props) {
  return (
    <div {...props} dangerouslySetInnerHTML={{ __html: children ?? "" }}></div>
  );
}
