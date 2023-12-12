import Icon from "@/src/icons/fontAwesome/FIcon";

interface HelpType {
  help_title: string;
  help_text: string;
  help_icon: string;
}

export default function HelpCard({ list }: { list: Array<HelpType> }) {
  return (
    !!list && (
      <div className="rounded-2xl border px-4 lg:px-8 grid gap-2">
        {list.map((item: any, key: any) => (
          <div
            key={key}
            className={`${key ? "border-t" : ""} py-5 lg:py-6 grid gap-2`}
          >
            {!!item.help_icon && (
              <div className="text-yellow-400 relative w-fit mb-2">
                <Icon icon={item.help_icon} className="text-5xl" />
                <Icon
                  icon={item.help_icon}
                  type="fa"
                  className="text-4xl mt-1 opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>
            )}
            <h4 className="text-zinc-900 leading-tight font-bold text-lg">
              {item.help_title}
            </h4>
            <div className="text-sm">{item.help_text}</div>
          </div>
        ))}
      </div>
    )
  );
}
