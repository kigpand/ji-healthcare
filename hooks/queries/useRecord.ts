import { QUERY_KEY } from "@/constants/queryKeys";
import { useLocalDay } from "@/hooks/useLocalDay";
import { IRecord, IRecordDetail } from "@/interface/record";
import { getRecord, getRecordDetail } from "@/service/recordService";
import { useQuery } from "@tanstack/react-query";

export function useRecord(days?: number) {
  const today = useLocalDay();
  return useQuery<IRecord[]>({
    queryKey: [QUERY_KEY.RECORD, days, today],
    queryFn: () => getRecord(days, new Date(today)),
  });
}

export function useRecordDetail(recordId?: string) {
  return useQuery<IRecordDetail | null>({
    queryKey: [QUERY_KEY.RECORD_DETAIL, recordId],
    queryFn: () => getRecordDetail(recordId!),
    enabled: !!recordId,
  });
}
