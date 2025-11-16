import CustomLatex from '@/model/CustomLatex'

export const CUSTOM_LATEX_UPDATE = 'CUSTOM_LATEX_UPDATE'

export interface CustomLatexUpdateAction {
  type: string
  payload: Partial<CustomLatexState>
}

export interface CustomLatexState {
  /** 指令库列表 */
  customLatexList: CustomLatex[]
  /** 兼容 svg 指令库 Map */
  customSvgMap: Record<string, CustomLatex>
  /** 录入替换库替换公式 Map */
  customReplaceFormulaMap: Record<string, string>
  /** 录入替换库替换文本 Map */
  customReplaceTextMap: Record<string, string>
}
