import { CUSTOM_LATEX_UPDATE, CustomLatexUpdateAction, CustomLatexState } from '@/store/types'

const defaultState: CustomLatexState = {
  customLatexList: [],
  customSvgMap: {},
  customReplaceFormulaMap: {},
  customReplaceTextMap: {}
}

export const customLatexReducer = (state: CustomLatexState = defaultState, action: CustomLatexUpdateAction) => {
  if (action.type === CUSTOM_LATEX_UPDATE) {
    return { ...state, ...action.payload }
  }
  return state
}
