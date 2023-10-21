import {IArgsQuery} from "@/interfaces/shared"
import { useSearchParams } from "react-router-dom";

export default function useQueriesString(): Partial<IArgsQuery> {
  const [searchParams] = useSearchParams();
  const searchParamsObject = Object.fromEntries([...searchParams]);
  return searchParamsObject;
}
