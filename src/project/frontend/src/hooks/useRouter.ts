import { useNavigate, useParams } from 'react-router-dom'
import useQuery from './useQuery'
import qs from 'qs'

type QueryType = Record<string, any>

export const getSearchPath = (path: string, query?: QueryType) => {
  const search = qs.stringify(query)
  return `${path}${search ? (path.includes('?') ? '&' : '?') : ''}${qs.stringify(query)}`
}

export const useRouter = () => {
  const [query, setQuery] = useQuery()
  const params = useParams()
  const navigate = useNavigate()

  const push = (pathname: string, query?: QueryType) => {
    navigate(getSearchPath(pathname, query))
  }

  const replace = (pathname: string, query?: QueryType) => {
    navigate(getSearchPath(pathname, query), { replace: true })
  }

  return {
    query,
    params,
    setQuery,
    replace,
    push,
    navigate
  }
}

export default useRouter
