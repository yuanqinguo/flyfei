export function getScroller(el: Element): Window | Element {
  const overflowScrollReg = /scroll|auto/i
  const target = getTargetParent(el, node => {
    const { overflowY } = window.getComputedStyle(node)
    if (overflowScrollReg.test(overflowY)) {
      return true
    }
    return false
  })

  return target || window
}

export function getTargetParent(el: Element, isTarget: (node: Element) => boolean): Element | null {
  let node: Element | null = el

  while (node && node.tagName !== 'HTML' && node.tagName !== 'BODY' && node.nodeType === 1) {
    if (isTarget(node)) {
      return node
    }
    node = node.parentNode as Element | null
  }

  return null
}
