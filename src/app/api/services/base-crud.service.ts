import { api } from "./api.service";
import type { ApiOptions } from "../types";

type ServiceResult<T> = { success: boolean; data?: T; error?: string };
type ListResult<TData, TPagination> = ServiceResult<TData> &
  ([TPagination] extends [never] ? {} : { pagination?: TPagination });

type CrudMessages = {
  listError: string;
  createError: string;
  updateError: string;
  deleteError: string;
};

const DEFAULT_MESSAGES: CrudMessages = {
  listError: "Erro ao buscar registros",
  createError: "Erro ao criar registro",
  updateError: "Erro ao atualizar registro",
  deleteError: "Erro ao excluir registro",
};

export abstract class BaseCrudService<
  TFrontend,
  TBackend,
  TCreate = unknown,
  TUpdate = unknown,
  TPagination = never,
> {
  constructor(
    protected readonly resource: string,
    protected readonly mapBackendToFrontend: (item: TBackend) => TFrontend,
    private readonly messages: Partial<CrudMessages> = {},
    private readonly hasPagination = false,
  ) {}

  protected get errorMessages(): CrudMessages {
    return { ...DEFAULT_MESSAGES, ...this.messages };
  }

  protected unwrapData<T>(payload: T | { data: T } | undefined): T | undefined {
    if (payload == null) return undefined;
    if (typeof payload === "object" && "data" in (payload as object)) {
      return (payload as { data: T }).data;
    }
    return payload as T;
  }

  protected unwrapList<T>(payload: T[] | { data: T[] } | undefined): T[] {
    const value = this.unwrapData(payload);
    return Array.isArray(value) ? value : [];
  }

  protected async getAllWithPagination(
    page = 1,
    limit = 10,
  ): Promise<ListResult<TFrontend[], TPagination>> {
    const result = await api.get<{ data: TBackend[]; pagination?: TPagination }>(
      `${this.resource}/?page=${page}&limit=${limit}`,
    );
    if (!result.success) {
      return { success: false, error: result.error || this.errorMessages.listError };
    }
    const raw = result.data as { data?: TBackend[]; pagination?: TPagination } | undefined;
    const dataArray = Array.isArray(raw?.data) ? raw.data : [];
    return {
      success: true,
      data: dataArray.map(this.mapBackendToFrontend),
      ...(raw?.pagination ? { pagination: raw.pagination } : {}),
    };
  }

  async getAll(options?: ApiOptions): Promise<ListResult<TFrontend[], TPagination>>;
  async getAll(page: number, limit?: number): Promise<ListResult<TFrontend[], TPagination>>;
  async getAll(
    optionsOrPage: ApiOptions | number = {},
    limit = 10,
  ): Promise<ListResult<TFrontend[], TPagination>> {
    if (this.hasPagination) {
      const page =
        typeof optionsOrPage === "number"
          ? optionsOrPage
          : Number(optionsOrPage.params?.page ?? 1);
      const finalLimit =
        typeof optionsOrPage === "number"
          ? limit
          : Number(optionsOrPage.params?.limit ?? limit);
      return this.getAllWithPagination(page, finalLimit);
    }

    const options = typeof optionsOrPage === "number" ? {} : optionsOrPage;
    const result = await api.get<TBackend[] | { data: TBackend[] }>(
      this.resource,
      options ?? {},
    );
    if (!result.success) {
      return { success: false, error: result.error || this.errorMessages.listError };
    }
    const items = this.unwrapList(result.data);
    return { success: true, data: items.map(this.mapBackendToFrontend) };
  }

  async create(data: TCreate): Promise<ServiceResult<TFrontend>> {
    const result = await api.post<TBackend | { data: TBackend }>(
      this.resource,
      data,
    );
    if (!result.success) {
      return { success: false, error: result.error || this.errorMessages.createError };
    }
    const item = this.unwrapData(result.data);
    if (!item) return { success: false, error: this.errorMessages.createError };
    return { success: true, data: this.mapBackendToFrontend(item as TBackend) };
  }

  async update(id: string, data: TUpdate): Promise<ServiceResult<TFrontend>> {
    const result = await api.patch<TBackend | { data: TBackend }>(
      `${this.resource}/${id}`,
      data,
    );
    if (!result.success) {
      return { success: false, error: result.error || this.errorMessages.updateError };
    }
    const item = this.unwrapData(result.data);
    if (!item) return { success: false, error: this.errorMessages.updateError };
    return { success: true, data: this.mapBackendToFrontend(item as TBackend) };
  }

  async delete(id: string): Promise<ServiceResult<null>> {
    const result = await api.delete<unknown>(`${this.resource}/${id}`);
    if (!result.success) {
      return { success: false, error: result.error || this.errorMessages.deleteError };
    }
    return { success: true, data: null };
  }
}
