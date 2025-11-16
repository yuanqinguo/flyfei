import { useSearchParams, SetURLSearchParams } from 'react-router-dom'

export const useQuery = (): [searchParams: Record<string, string>, setSearchParams: SetURLSearchParams] => {
  const [searchParams, setSearchParams] = useSearchParams()
  return [Object.fromEntries([...searchParams]), setSearchParams]
}

export default useQuery
