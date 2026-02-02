import { useEffect, useState } from "react";
import Api from "@/src/services/api";

export type Segment = { id: number | string; name: string; icon?: string | null };

export function useSegmentGroups() {
    const api = new Api();
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const res = await api.bridge<{ response: boolean; data?: Segment[]; error?: string }>({
                    method: "get",
                    url: "group/segmentgroups",
                    noAppPrefix: true, 
                });
                if (!mounted) return;

                if (res?.response && Array.isArray(res?.data)) {
                    setSegments(res.data);
                    setError(null);
                } else {
                    setSegments([]);
                    setError(res?.error || "Não foi possível carregar segmentos.");
                }
            } catch (err) {
                if (!mounted) return;
                setSegments([]);
                setError("Erro ao buscar segmentos.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return { segments, loading, error };
}