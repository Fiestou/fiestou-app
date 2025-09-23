import sanitize from 'sanitize-html';

type NameAndDescriptionProps = {
  name: string;
  shortDescription?: string;
  longDescriptionHtml?: string; // renderizado com cuidado
  onEdit?: () => void;
};


export default function NameAndDescription({ name, shortDescription, longDescriptionHtml, onEdit }: NameAndDescriptionProps) {
  return (
    <section aria-labelledby="product-name" className="mb-6">
      <h1 id="product-name" className="text-2xl font-bold">{name}</h1>
      {shortDescription && <p className="text-sm text-gray-600 mt-1">{shortDescription}</p>}
      {longDescriptionHtml && (
        <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: sanitize(longDescriptionHtml) }} />
      )}
      {onEdit && <button onClick={onEdit} className="mt-4 btn">Editar</button>}
    </section>
  );
}