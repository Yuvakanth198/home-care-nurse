import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Feedback, Nurse, ServiceProof } from "../backend";
import { useActor } from "./useActor";

export function useListAllNurses(refreshKey = 0) {
  const { actor } = useActor();
  return useQuery<Nurse[]>({
    queryKey: ["nurses", refreshKey],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllNurses();
    },
    enabled: !!actor,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useFilterByPincode(pincode: string) {
  const { actor } = useActor();
  return useQuery<Nurse[]>({
    queryKey: ["nurses", "pincode", pincode],
    queryFn: async () => {
      if (!actor || !pincode) return [];
      return actor.filterByPincode(BigInt(pincode));
    },
    enabled: !!actor && pincode.length === 6,
  });
}

export function useGetNurse(id: string) {
  const { actor } = useActor();
  return useQuery<Nurse | null>({
    queryKey: ["nurse", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNurse(id);
    },
    enabled: !!actor && !!id,
  });
}

export function useGetNurseFeedback(nurseId: string) {
  const { actor } = useActor();
  return useQuery<Feedback[]>({
    queryKey: ["feedback", nurseId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNurseFeedback(nurseId);
    },
    enabled: !!actor && !!nurseId,
  });
}

export function useGetAggregateRating(nurseId: string) {
  const { actor } = useActor();
  return useQuery<number | null>({
    queryKey: ["rating", nurseId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAggregateRating(nurseId);
    },
    enabled: !!actor && !!nurseId,
  });
}

export function useIsCallerAdmin() {
  const { actor } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor,
  });
}

export function useSubmitFeedback() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (feedback: Feedback) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitFeedback(feedback);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["feedback", variables.nurseId] });
      qc.invalidateQueries({ queryKey: ["rating", variables.nurseId] });
    },
  });
}

export function useAddNurse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nurse: Nurse) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerNurse(nurse);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nurses"] });
    },
  });
}

export function useUpdateNurse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nurse: Nurse) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateNurse(nurse);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["nurses"] });
      qc.invalidateQueries({ queryKey: ["nurse", variables.id] });
    },
  });
}

export function useDeleteNurse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nurseId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteNurse(nurseId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nurses"] });
    },
  });
}

export function useRegisterNurse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nurse: Nurse) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerNurse(nurse);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nurses"] });
    },
  });
}

export function useFindNurseByCredentials() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      registrationNumber,
      phone,
    }: {
      registrationNumber: string;
      phone: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.findNurseByCredentials(registrationNumber, phone);
    },
  });
}

export function useAddServiceProof() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (proof: ServiceProof) => {
      if (!actor) throw new Error("Not connected");
      return actor.addServiceProof(proof);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["serviceProofs", variables.nurseId],
      });
      qc.invalidateQueries({ queryKey: ["allServiceProofs"] });
    },
  });
}

export function useGetNurseServiceProofs(nurseId: string) {
  const { actor } = useActor();
  return useQuery<ServiceProof[]>({
    queryKey: ["serviceProofs", nurseId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNurseServiceProofs(nurseId);
    },
    enabled: !!actor && !!nurseId,
  });
}

export function useUpdateServiceProof() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (proof: ServiceProof) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateServiceProof(proof);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["serviceProofs", variables.nurseId] });
      qc.invalidateQueries({ queryKey: ["allServiceProofs"] });
    },
  });
}

export function useDeleteServiceProof() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (proofId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteServiceProof(proofId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviceProofs"] });
      qc.invalidateQueries({ queryKey: ["allServiceProofs"] });
    },
  });
}

export function useListAllServiceProofs() {
  const { actor } = useActor();
  return useQuery<ServiceProof[]>({
    queryKey: ["allServiceProofs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllServiceProofs();
    },
    enabled: !!actor,
  });
}

export function useSetNurseAvailability() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      registrationNumber,
      phone,
      isAvailable,
    }: {
      registrationNumber: string;
      phone: string;
      isAvailable: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setNurseAvailability(registrationNumber, phone, isAvailable);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nurses"] });
    },
  });
}

export function useUpdateNurseLocation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      registrationNumber,
      phone,
      latitude,
      longitude,
    }: {
      registrationNumber: string;
      phone: string;
      latitude: number;
      longitude: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateNurseLocation(
        registrationNumber,
        phone,
        latitude,
        longitude,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nurses"] });
    },
  });
}
