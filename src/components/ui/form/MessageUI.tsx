interface MessageType {
  content?: any;
}

export default function Message(attr: MessageType) {
  return (
    <div
      className="bg-zinc-100 text-zinc-900 rounded-md py-2 px-3 text-sm"
      dangerouslySetInnerHTML={{ __html: attr?.content }}
    ></div>
  );
}
