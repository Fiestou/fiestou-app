type Period = {
  id: string;
  from: Date;
  to: Date;
};

type UnavailablePeriodsProps = {
  periods: Period[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  formatDate: (date: Date) => string;
};

export default function UnavailablePeriods({
  periods = [],
  onAdd,
  onDelete,
  formatDate,
}: UnavailablePeriodsProps) {
  return (
    <section>
      <h3>Períodos indisponíveis</h3>
      <ul>
        {periods.map((p) => (
          <li key={p.id} className="flex justify-between">
            <span>
              {formatDate(p.from)} — {formatDate(p.to)}
            </span>
            <button
              onClick={() => onDelete(p.id)}
              className="text-red-500"
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onAdd} className="btn mt-3">
        Adicionar período
      </button>
    </section>
  );
}
