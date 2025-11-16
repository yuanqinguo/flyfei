import { systemReducer } from './system'
import { sessionReducer } from './session'
import { baseDataReducer } from './baseData'
import { customLatexReducer } from './customLatex'
import { combineReducers } from 'redux'

const reducers = combineReducers({
  system: systemReducer,
  session: sessionReducer,
  baseData: baseDataReducer,
  customLatex: customLatexReducer
})

export default reducers
