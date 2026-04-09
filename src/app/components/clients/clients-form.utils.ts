import type { CreateClientsDTO } from '../../api';
import type { ClientFormData } from './hooks/useClientsForm';

/** Campo opcional: após trim vazio → `undefined` (omitido no `JSON.stringify` / Axios). */
export function optTrim(s: string | null | undefined): string | undefined {
  const t = (s ?? '').trim();
  return t.length > 0 ? t : undefined;
}

export function buildOptionalUsaAddress(
  a: ClientFormData['usaAddress'],
): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  const put = (key: string, v: string | undefined) => {
    if (v !== undefined) out[key] = v;
  };
  put('rua', optTrim(a.rua));
  put('numero', optTrim(a.numero));
  put('cidade', optTrim(a.cidade));
  put('estado', optTrim(a.estado));
  put('zipCode', optTrim(a.zipCode));
  put('complemento', optTrim(a.complemento));
  return Object.keys(out).length > 0 ? out : undefined;
}

export function buildOptionalBrazilAddress(
  a: ClientFormData['brazilAddress'],
): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  const put = (key: string, v: string | undefined) => {
    if (v !== undefined) out[key] = v;
  };
  put('rua', optTrim(a.rua));
  put('bairro', optTrim(a.bairro));
  put('numero', optTrim(a.numero));
  put('cidade', optTrim(a.cidade));
  put('estado', optTrim(a.estado));
  put('cep', optTrim(a.cep));
  put('complemento', optTrim(a.complemento));
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Payload de criação: sem `""` em opcionais; endereços só com chaves preenchidas. */
export function buildCreateClientsPayload(formData: ClientFormData): CreateClientsDTO {
  const usaName = (formData.usaName ?? '').trim();
  const userId = (formData.userId ?? '').trim();

  const payload: CreateClientsDTO = {
    usaName,
    userId,
    status: formData.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
  };

  const usaCpf = optTrim(formData.usaCpf);
  if (usaCpf !== undefined) payload.usaCpf = usaCpf;

  const usaPhone = optTrim(formData.usaPhone);
  if (usaPhone !== undefined) payload.usaPhone = usaPhone;

  const brazilName = optTrim(formData.brazilName);
  if (brazilName !== undefined) payload.brazilName = brazilName;

  const brazilCpf = optTrim(formData.brazilCpf);
  if (brazilCpf !== undefined) payload.brazilCpf = brazilCpf;

  const brazilPhone = optTrim(formData.brazilPhone);
  if (brazilPhone !== undefined) payload.brazilPhone = brazilPhone;

  const usaAddress = buildOptionalUsaAddress(formData.usaAddress);
  if (usaAddress !== undefined) {
    payload.usaAddress = usaAddress as CreateClientsDTO['usaAddress'];
  }

  const brazilAddress = buildOptionalBrazilAddress(formData.brazilAddress);
  if (brazilAddress !== undefined) {
    payload.brazilAddress = brazilAddress as CreateClientsDTO['brazilAddress'];
  }

  return payload;
}
