"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { instrumentsService, InstrumentQuery } from "@/services/instruments/instruments.service";
import { Instrument, RegisterInstrumentDto } from "@/types/instrument";

/**
 * Query keys are built in one place so a mutation can never invalidate a key
 * that no query actually uses — the classic cause of a list that refuses to
 * update after a write.
 */
export const instrumentKeys = {
  all: ["instruments"] as const,
  lists: () => [...instrumentKeys.all, "list"] as const,
  list: (query: InstrumentQuery) => [...instrumentKeys.lists(), query] as const,
  details: () => [...instrumentKeys.all, "detail"] as const,
  detail: (id: string) => [...instrumentKeys.details(), id] as const,
};

/** The instrument registry, scoped by the server to what the caller may see. */
export function useInstruments(query: InstrumentQuery = {}) {
  return useQuery({
    queryKey: instrumentKeys.list(query),
    queryFn: () => instrumentsService.list(query),
    // Keep the previous page on screen while the next one loads, instead of
    // collapsing the table to a spinner on every filter change.
    placeholderData: (previous) => previous,
  });
}

/** Convenience for screens that only want the rows. */
export function useInstrumentList(query: InstrumentQuery = {}) {
  const result = useInstruments(query);

  return { ...result, instruments: result.data?.items ?? [] };
}

export function useInstrument(id: string | undefined) {
  return useQuery({
    queryKey: instrumentKeys.detail(id ?? ""),
    queryFn: () => instrumentsService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useRegisterInstrument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterInstrumentDto) => instrumentsService.register(payload),
    onSuccess: (created) => {
      // Seed the detail cache so navigating straight to the new instrument
      // renders immediately rather than showing a loading state for data we
      // already hold.
      queryClient.setQueryData(instrumentKeys.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: instrumentKeys.lists() });
    },
  });
}

export function useUpdateInstrument(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<RegisterInstrumentDto>) =>
      instrumentsService.update(id, payload),
    onSuccess: (updated: Instrument) => {
      queryClient.setQueryData(instrumentKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: instrumentKeys.lists() });
    },
  });
}

/** Retires an instrument. The server marks it INACTIVE; nothing is deleted. */
export function useRetireInstrument(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => instrumentsService.deactivate(id),
    onSuccess: (updated: Instrument) => {
      queryClient.setQueryData(instrumentKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: instrumentKeys.lists() });
    },
  });
}
