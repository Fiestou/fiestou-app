import { ReactNode } from "react";

interface InfoBoxProps {
    icon: ReactNode; // Renomeie para 'icon' para clareza
    title: string;
    subscription: string;
}

export default function InfoBox({
    icon,
    title,
    subscription,
}: InfoBoxProps) {
    return (
        <div className="p-4 flex flex-col justify-center items-center border border-black/20 rounded-lg ga">
            <div className="flex justify-start items-center gap-2 w-full">
                {icon}
                <h2 className="font-bold text-black/95 text-lg">{title}</h2>
            </div>
            <p className="text-sm text-black/60">{subscription}</p>
        </div>
    );
}
