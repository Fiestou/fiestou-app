import React, { useEffect, useState } from 'react';
import Api from '@/src/services/api';
import Link from 'next/link';

interface OnboardingData {
    completion: {
        percentage: number;
        sections: {
            personal: number;
            address: number;
            bank: number;
            income: number;
        };
        missing_fields: string[];
    };
    pagarme_status: 'pending' | 'ready' | 'active';
    actions_needed: string[];
    is_pj: boolean;
}

interface Props {
    onOpenPagarme?: () => void;
}

const OnboardingProgress: React.FC<Props> = ({ onOpenPagarme }) => {
    const api = new Api();
    const [data, setData] = useState<OnboardingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res: any = await api.bridge({
                method: 'GET',
                url: 'info/onboarding-profile',
            });
            if (res?.response && res?.data) {
                setData(res.data);
            }
        } catch (err) {
            console.error('Erro ao buscar onboarding:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { completion, pagarme_status, actions_needed } = data;
    const percentage = completion.percentage;

    const getProgressColor = () => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getStatusBadge = () => {
        switch (pagarme_status) {
            case 'active':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Ativo na Pagar.me</span>;
            case 'ready':
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pronto para ativar</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Cadastro incompleto</span>;
        }
    };

    const getSectionLabel = (key: string) => {
        const labels: Record<string, string> = {
            personal: 'Dados pessoais',
            address: 'Endereço',
            bank: 'Dados bancários',
            income: data.is_pj ? 'Faturamento/Sócios' : 'Renda/Profissão',
        };
        return labels[key] || key;
    };

    if (percentage === 100 && pagarme_status === 'active') {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Completude do cadastro</h3>
                {getStatusBadge()}
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-medium">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {Object.entries(completion.sections).map(([key, value]) => (
                    <div key={key} className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500 mb-1">{getSectionLabel(key)}</div>
                        <div className={`text-sm font-medium ${value === 100 ? 'text-green-600' : 'text-gray-700'}`}>
                            {value}%
                        </div>
                    </div>
                ))}
            </div>

            {actions_needed.length > 0 && (
                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Próximos passos:</h4>
                    <ul className="space-y-2">
                        {actions_needed.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="text-yellow-500 mt-0.5">•</span>
                                {action}
                            </li>
                        ))}
                    </ul>

                    {pagarme_status === 'ready' && onOpenPagarme && (
                        <button
                            onClick={onOpenPagarme}
                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                            Finalizar cadastro na Pagar.me
                        </button>
                    )}

                    {pagarme_status === 'pending' && (
                        <Link href="/painel/dados_do_recebedor">
                            <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                                Completar cadastro
                            </button>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default OnboardingProgress;
