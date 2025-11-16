import { compose, legacy_createStore as createStore } from 'redux'
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux'
import reducers from '@/store/reducers'

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(reducers, composeEnhancers())

export type AppState = ReturnType<typeof reducers>
export type AppDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
export const useAppDispatch: () => AppDispatch = useDispatch

export default store
