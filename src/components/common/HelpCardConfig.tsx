
interface HelpType {
  help_title: string;
  help_text: string;
  help_icon: React.ReactNode;
  help_complete?: string;
}

export default function HelpCardConfig(props: HelpType) {
  return (
    <div className="rounded-2xl border px-4 lg:px-8 flex gap-4 flex-col p-2">
        <div className="flex justify-start items-center gap-2 w-full">
          {props.help_icon}
          <h4 className="text-zinc-900 font-bold text-lg">
            {props.help_title}
          </h4>
        </div>
        <div className="text-sm">{props.help_text}</div>
        <div className="text-sm">{props.help_complete}</div>
    </div>
  );
}
