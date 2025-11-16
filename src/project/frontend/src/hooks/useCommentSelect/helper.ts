export const removeParentElement = (el: any) => {
  if (el) {
    const container = el.parentNode
    const childElements = Array.from(el.childNodes)

    childElements.forEach(child => {
      container?.insertBefore(child, el)
    })

    container?.removeChild(el)
  }
}

export const getSelectedHtml = () => {
  let html = ''
  if (window.getSelection) {
    const sel = window.getSelection()
    if (sel?.rangeCount) {
      const container = document.createElement('div')
      for (let i = 0, len = sel.rangeCount; i < len; ++i) {
        container.appendChild(sel.getRangeAt(i).cloneContents())
      }
      html = container.innerHTML
    }
  }
  return html
}

export const isSelectionInContainer = (container: any) => {
  const selection = window.getSelection()

  // 没有选中任何东西
  if (!selection || selection.rangeCount === 0 || selection.toString().length < 0) {
    return false
  }

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i)

    // 检查 Range 的祖先容器是否在指定容器内
    if (!container.contains(range.commonAncestorContainer)) {
      return false
    }

    // 检查选区的起始和结束节点是否在容器内
    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
      return false
    }
  }

  return true
}

export const getHtmlById = (id: string) => document.getElementById(id)?.innerHTML || ''
