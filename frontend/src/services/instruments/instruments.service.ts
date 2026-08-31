import { api } from "@/lib/api";
import {
  Instrument,
  Paginated,
  RegisterInstrumentDto,
} from "@/types/instrument";

export interface InstrumentQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  instrumentType?: string;
  businessId?: string;
}

/**
 * Instrument registry. The server decides what the caller may see — a business
 * user is scoped to their own instruments regardless of what is asked for here.
 */
export const instrumentsService = {
  async list(query: InstrumentQuery = {}): Promise<Paginated<Instrument>> {
    const { data } = await api.get<Paginated<Instrument>>("/instruments/", {
      params: query,
    });

    return data;
  },

  async get(id: string): Promise<Instrument> {
    const { data } = await api.get<Instrument>(`/instruments/${id}/`);

    return data;
  },

  async register(payload: RegisterInstrumentDto): Promise<Instrument> {
    const { data } = await api.post<Instrument>("/instruments/", payload);

    return data;
  },

  async update(id: string, payload: Partial<RegisterInstrumentDto>): Promise<Instrument> {
    const { data } = await api.patch<Instrument>(`/instruments/${id}/`, payload);

    return data;
  },

  /**
   * Retires an instrument rather than deleting it — it may already be
   * referenced by an inspection or certificate, so the server marks it
   * INACTIVE and returns the updated record.
   */
  async deactivate(id: string): Promise<Instrument> {
    const { data } = await api.delete<Instrument>(`/instruments/${id}/`);

    return data;
  },
};

export default instrumentsService;

/* Named exports kept for the existing pages; the envelope is unwrapped here. */

export async function getInstruments(query: InstrumentQuery = {}) {
  return (await instrumentsService.list(query)).items;
}

export async function getInstrumentById(id: string) {
  return instrumentsService.get(id);
}

export async function registerInstrument(payload: RegisterInstrumentDto) {
  return instrumentsService.register(payload);
}
