import React, { useEffect, useState } from 'react';
import { Button, Input } from '../../ui/form';
import { UserType } from '@/src/models/user';
import { toast } from 'react-toastify';
import Api from '@/src/services/api';
import { formatPhone, formatCep } from '@/src/components/utils/FormMasks';
import ArrowUp from '@/src/icons/arrowUp';
import ArrowDown from '@/src/icons/arrowDown';

interface Props {
    user: UserType;
    onUpdate?: () => void;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    address: {
        zipCode: string;
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
    };
}

const UserDataSimple: React.FC<Props> = ({ user, onUpdate }) => {
    const api = new Api();
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openPersonal, setOpenPersonal] = useState(true);
    const [openAddress, setOpenAddress] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        address: {
            zipCode: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
        }
    });

    useEffect(() => {
        if (user) {
            const userAddr = (user as any)?.address?.[0];
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: {
                    zipCode: userAddr?.zipCode || '',
                    street: userAddr?.street || '',
                    number: String(userAddr?.number || ''),
                    complement: userAddr?.complement || '',
                    neighborhood: userAddr?.neighborhood || '',
                    city: userAddr?.city || '',
                    state: userAddr?.state || '',
                }
            });
        }
    }, [user]);

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (field: keyof FormData['address'], value: string) => {
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
    };

    const fetchCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        street: data.logradouro || prev.address.street,
                        neighborhood: data.bairro || prev.address.neighborhood,
                        city: data.localidade || prev.address.city,
                        state: data.uf || prev.address.state,
                    }
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    };

    const handleCepChange = (value: string) => {
        const masked = formatCep(value);
        handleAddressChange('zipCode', masked);
        if (value.replace(/\D/g, '').length === 8) {
            fetchCep(value);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await api.bridge({
                method: 'post',
                url: 'users/update',
                data: {
                    name: formData.name,
                    phone: formData.phone.replace(/\D/g, ''),
                    address: [{
                        zipCode: formData.address.zipCode.replace(/\D/g, ''),
                        street: formData.address.street,
                        number: formData.address.number,
                        complement: formData.address.complement,
                        neighborhood: formData.address.neighborhood,
                        city: formData.address.city,
                        state: formData.address.state,
                    }]
                }
            });

            if (response) {
                toast.success('Dados atualizados com sucesso!');
                setEditMode(false);
                onUpdate?.();
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error('Erro ao atualizar dados.');
        } finally {
            setLoading(false);
        }
    };

    const SectionHeader = ({ title, open, toggle }: { title: string; open: boolean; toggle: () => void }) => (
        <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h2 className="text-2xl font-semibold cursor-pointer" onClick={toggle}>
                {title}
            </h2>
            <div className="flex items-center gap-4">
                {!editMode ? (
                    <Button onClick={() => setEditMode(true)} type="button" style="btn-link">
                        Editar
                    </Button>
                ) : (
                    <>
                        <Button onClick={() => setEditMode(false)} type="button" style="btn-link">
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} type="button" style="btn-primary" loading={loading}>
                            Salvar
                        </Button>
                    </>
                )}
                <span className="cursor-pointer" onClick={toggle}>
                    {open ? <ArrowUp /> : <ArrowDown />}
                </span>
            </div>
        </div>
    );

    const DisplayField = ({ label, value }: { label: string; value: string }) => (
        <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-100">
            <div className="w-full md:w-1/3">
                <span className="text-sm font-medium text-gray-600">{label}</span>
            </div>
            <div className="w-full md:w-2/3">
                {value ? (
                    <span className="text-gray-900">{value}</span>
                ) : (
                    <span className="text-red-500 text-sm">Não preenchido</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Dados Pessoais */}
            <div>
                <SectionHeader title="Dados Pessoais" open={openPersonal} toggle={() => setOpenPersonal(!openPersonal)} />
                {openPersonal && (
                    <div className="space-y-2">
                        {editMode ? (
                            <div className="grid gap-4">
                                <Input
                                    name="name"
                                    placeholder="Nome completo"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                                <Input
                                    name="email"
                                    placeholder="E-mail"
                                    value={formData.email}
                                    disabled
                                    className="bg-gray-100"
                                />
                                <Input
                                    name="phone"
                                    placeholder="Telefone"
                                    value={formatPhone(formData.phone)}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            </div>
                        ) : (
                            <>
                                <DisplayField label="Nome" value={formData.name} />
                                <DisplayField label="E-mail" value={formData.email} />
                                <DisplayField label="Telefone" value={formatPhone(formData.phone)} />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Endereço */}
            <div>
                <SectionHeader title="Endereço" open={openAddress} toggle={() => setOpenAddress(!openAddress)} />
                {openAddress && (
                    <div className="space-y-2">
                        {editMode ? (
                            <div className="grid gap-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        name="zipCode"
                                        placeholder="CEP"
                                        value={formData.address.zipCode}
                                        onChange={(e) => handleCepChange(e.target.value)}
                                        maxLength={9}
                                    />
                                    <Input
                                        name="state"
                                        placeholder="UF"
                                        value={formData.address.state}
                                        onChange={(e) => handleAddressChange('state', e.target.value.toUpperCase())}
                                        maxLength={2}
                                    />
                                </div>
                                <Input
                                    name="street"
                                    placeholder="Rua"
                                    value={formData.address.street}
                                    onChange={(e) => handleAddressChange('street', e.target.value)}
                                />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        name="number"
                                        placeholder="Número"
                                        value={formData.address.number}
                                        onChange={(e) => handleAddressChange('number', e.target.value)}
                                    />
                                    <Input
                                        name="complement"
                                        placeholder="Complemento"
                                        value={formData.address.complement}
                                        onChange={(e) => handleAddressChange('complement', e.target.value)}
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        name="neighborhood"
                                        placeholder="Bairro"
                                        value={formData.address.neighborhood}
                                        onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                                    />
                                    <Input
                                        name="city"
                                        placeholder="Cidade"
                                        value={formData.address.city}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <DisplayField label="CEP" value={formData.address.zipCode} />
                                <DisplayField label="Rua" value={formData.address.street} />
                                <DisplayField label="Número" value={formData.address.number} />
                                <DisplayField label="Complemento" value={formData.address.complement} />
                                <DisplayField label="Bairro" value={formData.address.neighborhood} />
                                <DisplayField label="Cidade" value={formData.address.city} />
                                <DisplayField label="UF" value={formData.address.state} />
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDataSimple;
