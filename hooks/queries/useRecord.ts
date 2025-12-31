import { QUERY_KEY } from "@/constants/queryKeys";
import { IRecord } from "@/interface/record";
import { getRecord } from "@/service/recordService";
import { useQuery } from "@tanstack/react-query";

export function useRecord() {
  return useQuery<IRecord[]>({
    queryKey: [QUERY_KEY.RECORD],
    queryFn: () => getRecord(),
  });
}
