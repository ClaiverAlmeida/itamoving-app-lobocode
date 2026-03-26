import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Building2, Edit, Globe, Mail, MapPin, Phone, Save } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { AcessoNegado } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { configurationsService } from '../api';
import type { Company, CompanyBackend, UpdateCompanyDTO } from '../api';

export default function ConfiguracoesView() {
    const { hasPermission } = useAuth();
    const hasAccess = hasPermission('configuracoes', 'read') && hasPermission('configuracoes', 'write');
    const [initial, setInitial] = useState<CompanyBackend | null>(null);
    const [form, setForm] = useState<CompanyBackend | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const load = async () => {
        try {
            const result = await configurationsService.getConfigurations();
            if (!result.success || !result.data) {
                toast.error(result.error ?? 'Falha ao carregar configurações da empresa.');
                setInitial(null);
                setForm(null);
                return;
            }
            setInitial(result.data as CompanyBackend);
            setForm(result.data as CompanyBackend);
        } catch (error: any) {
            toast.error(error?.message ?? 'Falha ao carregar configurações da empresa.');
            setInitial(null);
            setForm(null);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const websiteHref = useMemo(() => {
        const raw = (initial?.website || '').trim();
        if (!raw) return '';
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        return `https://${raw}`;
    }, [initial?.website]);

    const isDirty = useMemo(() => {
        if (!initial || !form) return false;
        // Mantém o summary/valores iniciais sem “trocar” enquanto edita
        return JSON.stringify(initial) !== JSON.stringify(form);
    }, [initial, form]);

    if (!hasAccess) return <AcessoNegado />;

    if (!initial || !form) {
        return (
            <div className="max-w-6xl mx-auto p-4 lg:p-0">
                <div className="text-sm text-muted-foreground">Carregando configurações...</div>
            </div>
        );
    }

    const handleCancel = () => {
        if (!initial) return;
        setForm(initial);
        toast.message('Alterações descartadas.');
    };

    type FilterKey =
        | 'name'
        | 'website'
        | 'address'
        | 'country'
        | 'contactName'
        | 'contactEmail'
        | 'contactPhone';

    const handleFormChange =
        (key: FilterKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setForm((prev) => {
                if (!prev) return prev;
                return { ...prev, [key]: value };
            });
        };

    const handleSave = async () => {
        try {
            if (!initial || !form || isSaving) return;
            setIsSaving(true);

            const current = {
                name: form.name,
                website: form.website,
                address: form.address,
                country: form.country,
                contactName: form.contactName,
                contactEmail: form.contactEmail,
                contactPhone: form.contactPhone,
            };

            const original = initial!;
            const patch: UpdateCompanyDTO = {};

            if (current.name !== original.name) patch.name = current.name;
            if (current.website !== original.website) patch.website = current.website;
            if (current.address !== original.address) patch.address = current.address;
            if (current.country !== original.country) patch.country = current.country;
            if (current.contactName !== original.contactName) patch.contactName = current.contactName;
            if (current.contactEmail !== original.contactEmail) patch.contactEmail = current.contactEmail;
            if (current.contactPhone !== original.contactPhone) patch.contactPhone = current.contactPhone;


            if (Object.keys(patch).length === 0) {
                toast.info("Nenhum campo alterado.");
                return;
            }

            const result = await configurationsService.update(initial.id, patch as Company);
            if (!result.success) {
                toast.error(result.error ?? 'Falha ao salvar configurações.');
                return;
            }

            toast.success('Configurações da empresa atualizadas.');

            // Recarrega pra garantir que summary volta ao “atual” do backend
            await load();
        } catch (error: any) {
            toast.error(error?.message ?? 'Falha ao salvar configurações.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            className="w-full p-4 lg:p-0"
        >
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-[#1E3A5F]" />
                            Configurações da empresa
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Endereço, contato e dados usados no sistema.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Resumo */}
                    <div className="lg:col-span-4">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
                                    <Building2 className="w-5 h-5" />
                                    Resumo
                                </CardTitle>
                                <CardDescription>Dados principais cadastrados.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-slate-50 p-4">
                                    <p className="text-xs text-muted-foreground">Nome</p>
                                    <p className="font-semibold text-lg leading-6 break-words">{initial?.name || '—'}</p>
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                                            <p className="text-slate-800 break-words">{initial?.address || '—'}</p>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm">
                                            <Phone className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                                            <p className="text-slate-800 break-words">{initial?.contactPhone || '—'}</p>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-slate-700 mt-0.5 flex-shrink-0" />
                                            <p className="text-slate-800 break-words">{initial?.contactEmail || '—'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4 bg-white">
                                    <p className="text-xs text-muted-foreground">Website</p>
                                    {websiteHref ? (
                                        <a
                                            href={websiteHref}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-[#1E3A5F] hover:underline break-all"
                                        >
                                            <Globe className="w-4 h-4" />
                                            <span>{initial?.website || '—'}</span>
                                        </a>
                                    ) : (
                                        <p className="mt-2 text-sm font-medium text-slate-500">—</p>
                                    )}

                                    <div className="mt-4 flex items-center justify-between gap-3">
                                        <div className="text-xs text-muted-foreground">País</div>
                                        <div className="text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border rounded-md px-3 py-1.5">
                                            {initial?.country || '—'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-8">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
                                    <Edit className="w-5 h-5" />
                                    Edição
                                </CardTitle>
                                <CardDescription>Edite as informações exibidas para a empresa.</CardDescription>
                            </CardHeader>

                            <CardContent className="pt-4">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        void handleSave();
                                    }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Dados gerais</p>
                                                <p className="text-xs text-muted-foreground">Informações de identificação e localização.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nome</Label>
                                                <Input
                                                    id="name"
                                                    value={form?.name ?? ''}
                                                    onChange={handleFormChange('name')}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="website">Website</Label>
                                                <Input
                                                    id="website"
                                                    value={form?.website ?? ''}
                                                    onChange={handleFormChange('website')}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address">Endereço</Label>
                                                <Input
                                                    id="address"
                                                    value={form?.address ?? ''}
                                                    onChange={handleFormChange('address')}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="country">País</Label>
                                                <Input
                                                    id="country"
                                                    value={form?.country ?? ''}
                                                    onChange={handleFormChange('country')}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t pt-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Contato</p>
                                            <p className="text-xs text-muted-foreground">Dados usados para contato com clientes.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contactName">Nome de Contato</Label>
                                                <Input
                                                    id="contactName"
                                                    value={form?.contactName ?? ''}
                                                    onChange={handleFormChange('contactName')}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="contactEmail">Email</Label>
                                                <Input
                                                    id="contactEmail"
                                                    value={form?.contactEmail ?? ''}
                                                    onChange={handleFormChange('contactEmail')}
                                                    type="email"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="contactPhone">Telefone</Label>
                                                <Input
                                                    id="contactPhone"
                                                    value={form?.contactPhone ?? ''}
                                                    onChange={handleFormChange('contactPhone')}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                            disabled={!isDirty || isSaving}
                                            className="w-full sm:w-auto"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!isDirty || isSaving}
                                            className="w-full sm:w-auto"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}