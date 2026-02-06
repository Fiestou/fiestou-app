import React, { useEffect, useState } from 'react';
import { Button, Select } from '../../ui/form';
import ArrowUp from '@/src/icons/arrowUp';
import ArrowDown from '@/src/icons/arrowDown';
import Api from '@/src/services/api';
import { toast } from 'react-toastify';

interface TransferSettings {
    transfer_enabled: boolean;
    transfer_interval: 'daily' | 'weekly' | 'monthly';
    transfer_day: number;
}

interface Props {
    title: string;
}

const INTERVAL_OPTIONS = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
];

const WEEKLY_DAY_OPTIONS = [
    { value: '1', label: 'Segunda-feira' },
    { value: '2', label: 'Terça-feira' },
    { value: '3', label: 'Quarta-feira' },
    { value: '4', label: 'Quinta-feira' },
    { value: '5', label: 'Sexta-feira' },
];

const GroupConfig: React.FC<Props> = ({ title }) => {
    const api = new Api();
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<TransferSettings>({
        transfer_enabled: true,
        transfer_interval: 'weekly',
        transfer_day: 5,
    });
    const [originalSettings, setOriginalSettings] = useState<TransferSettings | null>(null);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res: any = await api.bridge({
                method: 'GET',
                url: 'info/transfer-settings',
            });
            if (res?.response && res?.data) {
                const rawInterval = (res.data.transfer_interval ?? 'weekly').toLowerCase();
                const data = {
                    transfer_enabled: res.data.transfer_enabled ?? true,
                    transfer_interval: rawInterval as 'daily' | 'weekly' | 'monthly',
                    transfer_day: Number(res.data.transfer_day) || 5,
                };
                setSettings(data);
                setOriginalSettings(data);
            }
        } catch (err) {
            console.error('Erro ao buscar config transferencia:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && !originalSettings) {
            fetchSettings();
        }
    }, [open]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res: any = await api.bridge({
                method: 'PATCH',
                url: 'info/transfer-settings',
                data: settings,
            });
            if (res?.response) {
                toast.success('Configurações atualizadas!');
                setOriginalSettings(settings);
                setEditMode(false);
            } else {
                toast.error(res?.message || 'Erro ao salvar');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (originalSettings) {
            setSettings(originalSettings);
        }
        setEditMode(false);
    };

    const formatInterval = (interval: string) => {
        const map: Record<string, string> = {
            daily: 'Diário',
            weekly: 'Semanal',
            monthly: 'Mensal',
        };
        return map[interval] || interval;
    };

    const formatDay = (interval: string, day: number) => {
        if (interval === 'daily') return '-';
        if (interval === 'weekly') {
            const days = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
            return days[day] || `Dia ${day}`;
        }
        return `Dia ${day}`;
    };

    const getDayOptions = () => {
        if (settings.transfer_interval === 'weekly') {
            return WEEKLY_DAY_OPTIONS;
        }
        return Array.from({ length: 28 }, (_, i) => ({
            value: String(i + 1),
            label: `Dia ${i + 1}`,
        }));
    };

    return (
        <div className="border-b pb-8 mb-0">
            <div className="flex justify-between items-center">
                <h2
                    className="text-2xl font-semibold cursor-pointer w-full"
                    onClick={() => setOpen(!open)}
                >
                    {title}
                </h2>
                <div className="flex justify-center items-center gap-5 relative">
                    <div className="absolute right-[199%] z-20">
                        {!editMode ? (
                            <Button onClick={() => setEditMode(true)} type="button" style="btn-link">
                                Editar
                            </Button>
                        ) : (
                            <>
                                <Button onClick={handleCancel} type="button" style="btn-link" disable={saving}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave} type="button" style="btn-primary" loading={saving}>
                                    Salvar
                                </Button>
                            </>
                        )}
                    </div>
                    <span
                        className="text-sm font-medium cursor-pointer"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <ArrowUp /> : <ArrowDown />}
                    </span>
                </div>
            </div>

            {open && (
                <div className="mt-6 flex flex-col gap-6">
                    {loading ? (
                        <p className="text-gray-500">Carregando...</p>
                    ) : (
                        <>
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-semibold">Transferência automática</h3>

                                <div className="flex items-center justify-between py-2">
                                    <span className="text-gray-700">Transferência habilitada</span>
                                    {editMode ? (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.transfer_enabled}
                                                onChange={(e) => setSettings({ ...settings, transfer_enabled: e.target.checked })}
                                                className="w-5 h-5"
                                            />
                                            <span>{settings.transfer_enabled ? 'Sim' : 'Não'}</span>
                                        </label>
                                    ) : (
                                        <span className="font-medium">{settings.transfer_enabled ? 'Sim' : 'Não'}</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <span className="text-gray-700">Frequência</span>
                                    {editMode ? (
                                        <select
                                            value={settings.transfer_interval}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                transfer_interval: e.target.value as 'daily' | 'weekly' | 'monthly',
                                                transfer_day: e.target.value === 'weekly' ? 5 : 1,
                                            })}
                                            className="border rounded px-3 py-2"
                                        >
                                            {INTERVAL_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="font-medium">{formatInterval(settings.transfer_interval)}</span>
                                    )}
                                </div>

                                {settings.transfer_interval !== 'daily' && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-gray-700">
                                            {settings.transfer_interval === 'weekly' ? 'Dia da semana' : 'Dia do mês'}
                                        </span>
                                        {editMode ? (
                                            <select
                                                value={String(settings.transfer_day)}
                                                onChange={(e) => setSettings({ ...settings, transfer_day: Number(e.target.value) })}
                                                className="border rounded px-3 py-2"
                                            >
                                                {getDayOptions().map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="font-medium">
                                                {formatDay(settings.transfer_interval, settings.transfer_day)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
                                <strong>Dica:</strong> O saldo disponível será transferido automaticamente para sua conta bancária
                                conforme a frequência configurada. Transferências ocorrem apenas em dias úteis.
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroupConfig;
