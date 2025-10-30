interface ProductCommentsProps {
  comments: any[];
}

export default function ProductComments({ comments }: ProductCommentsProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2">Avaliações ({comments.length})</h3>
      {comments.length === 0 ? (
        <p className="text-sm text-zinc-600">Nenhuma avaliação ainda.</p>
      ) : (
        comments.map((c, i) => (
          <div key={i} className="border-b py-2">
            <p className="text-sm">{c.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}
