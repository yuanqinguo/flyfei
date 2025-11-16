import { delay, uuid } from '@/utils'
import { getScroller } from '@/utils/dom'
import { showCommentConfirm } from './CommentConfirm'
import { useDebounceFn } from 'ahooks'
import { message } from 'antd'
import { useEffect, useRef } from 'react'
import {
  IS_COMMENT_CLASS,
  HIGHLIGHT_CLASS,
  HIGHLIGHT_ACTIVE_CLASS,
  COMMENT_PREFIX,
  getCommentIdByClass
} from './useCommentId'

export const BLOCK_ELEMENTS = [
  'address',
  'article',
  'aside',
  'blockquote',
  'details',
  'dialog',
  'dd',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'td',
  'th',
  'tr',
  'ul'
].join(',')

interface CommentItem {
  content: string
  id: string
  type: string
  _isEdit?: boolean
}

export const getCommentIdClass = (id: string) => `${COMMENT_PREFIX}${id}`

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

interface CommentSelectProps {
  /** 内容元素id */
  contentElemId: string
  /** 当前选中的评论id */
  commentId: string
  /** 评论id改变时回调 */
  onCommentIdChange: (id: string) => void
  /** 添加评论时回调 */
  onAddComment: (index: number, comment: CommentItem) => void
}

export const useCommentSelect = ({ contentElemId, commentId, onCommentIdChange, onAddComment }: CommentSelectProps) => {
  const prevAddContent = useRef<CommentItem>({
    id: '',
    type: '',
    content: ''
  })
  const getContentElem = () => {
    return document.getElementById(contentElemId)
  }

  const getCommentElements = () => {
    const elements = getContentElem()?.getElementsByClassName(IS_COMMENT_CLASS) || []
    return Array.from(elements)
  }

  useEffect(() => {
    setTimeout(() => {
      const elements = getCommentElements()
      elements.forEach(element => {
        const classList = Array.from(element.classList)
        if (commentId) {
          if (classList.includes(getCommentIdClass(commentId))) {
            if (!classList.includes(HIGHLIGHT_ACTIVE_CLASS)) {
              element.classList.add(HIGHLIGHT_ACTIVE_CLASS)
            }
          } else {
            element.classList.remove(HIGHLIGHT_ACTIVE_CLASS)
          }
        } else {
          element.classList.remove(HIGHLIGHT_ACTIVE_CLASS)
        }
      })
    }, 300)
  }, [commentId])

  const handleCommentClick = async (el: string | HTMLElement) => {
    let id: string
    if (typeof el === 'string') {
      id = el
    } else {
      id = getCommentIdByClass(
        (Array.from(el.classList) as string[]).find(className => className.startsWith(COMMENT_PREFIX)) || ''
      )
    }
    await delay(10)
    onCommentIdChange(id)
    scrollToComment(id)
  }

  const scrollToComment = async (id: string) => {
    await delay(300)

    const commentElem = document.getElementById(`comment-card-${id}`)
    const commentElemRect = commentElem?.getBoundingClientRect()
    const scroller = getScroller(commentElem as HTMLElement) as any
    const commentContainerRect = scroller?.getBoundingClientRect()
    if (commentElem && commentContainerRect && commentElemRect) {
      const scroller = getScroller(commentElem)
      scroller.scrollTo({
        top: commentElem.offsetTop - 140,
        behavior: 'smooth'
      })
    }
  }

  const removeComment = (id: string) => {
    const _id = id.includes(COMMENT_PREFIX) ? id : getCommentIdClass(id)
    const elements = document.querySelectorAll(`.${_id}`)

    elements.forEach(element => {
      const parent = element.parentNode
      if (!parent) return

      // 创建一个文档片段来存储元素的内容
      const fragment = document.createDocumentFragment()

      // 将所有子节点移动到文档片段中
      while (element.firstChild) {
        fragment.appendChild(element.firstChild)
      }

      // 用文档片段替换原始元素
      element.parentNode?.replaceChild(fragment, element)

      // 合并相邻的文本节点
      parent.normalize()
    })
  }

  function findClosest(element: HTMLElement, selector: string) {
    if (!element.closest) return null
    return element.closest(selector)
  }

  const wrapRangeWithSpan = (range: Range, commentIdClass: string) => {
    const contents = range.cloneContents()
    if (contents.childNodes.length === 0) return

    const span = document.createElement('span')
    span.classList.add(IS_COMMENT_CLASS, commentIdClass)
    // 检查范围内是否包含图片
    const hasImage = Array.from(contents.childNodes).some(
      node => node.nodeName === 'IMG' || (node instanceof Element && node.querySelector('img'))
    )
    if (hasImage) {
      // 检查是否有带width样式的图片
      const images = Array.from(contents.querySelectorAll('img'))
      const hasImageWithWidth = images.some(
        img => img.style.width || img.getAttribute('width') || img.getAttribute('style')?.includes('width')
      )
      if (hasImageWithWidth) {
        span.style.width = '100%'
      }
    }

    try {
      range.surroundContents(span)
    } catch (e) {
      // 如果surroundContents失败，使用更完善的替代方案
      const contents = range.extractContents()
      span.appendChild(contents)
      range.insertNode(span)

      // 清理空标签
      const parent = span.parentElement
      if (parent) {
        // 合并相邻的文本节点
        parent.normalize()
        // 移除空的标签flag标签
        Array.from(parent.children).forEach(child => {
          if (child !== span && child.textContent?.trim() === '' && child.tagName === 'FLAG') {
            parent.removeChild(child)
          }
        })
      }
    }

    return span
  }

  // 添加一个检查元素是否为空的辅助函数
  function isEmptyElement(node: Node): boolean {
    try {
      // 如果是文本节点，检查是否只包含空白
      if (node.nodeType === Node.TEXT_NODE) {
        return !node.textContent?.trim()
      }

      // 如果是元素节点
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        // 如果只有一个 br 标签
        if (element.childNodes.length === 1 && element.firstChild?.nodeName === 'BR') {
          return true
        }
        // 检查所有子节点
        const hasNonEmptyChild = Array.from(element.childNodes).some(child => !isEmptyElement(child))
        return !hasNonEmptyChild
      }

      return true
    } catch (e) {
      return false
    }
  }

  const { run: onSelect } = useDebounceFn(
    async (type: string) => {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection?.getRangeAt(0)
      // 如果选择范围为空（即点击），则直接返回
      if (range.collapsed) return
      const { startContainer, endContainer } = range
      // 检查选中范围是否跨越多个.ques-render-select-content元素
      const startSelectContent =
        (startContainer as Element).closest?.('.ques-render-select-content') ||
        startContainer.parentElement?.closest('.ques-render-select-content')
      const endSelectContent =
        (endContainer as Element).closest?.('.ques-render-select-content') ||
        endContainer.parentElement?.closest('.ques-render-select-content')

      if (startSelectContent && endSelectContent && startSelectContent !== endSelectContent) {
        message.warning('不支持跨区域选择内容添加批注')
        return
      }

      if (startContainer.parentElement && endContainer.parentElement) {
        const formulaStart = findClosest(startContainer.parentElement, '[data-j-type="formula"]')
        const formulaEnd = findClosest(endContainer.parentElement, '[data-j-type="formula"]')

        // 如果指针的开始位置在公式的一半，则选中整个公式
        if (formulaStart) {
          range.setStart(formulaStart, 0)
        }
        // 如果指针的结束位置在公式的一半，则选中整个公式
        if (formulaEnd) {
          range.setEnd(formulaEnd, formulaEnd.childNodes.length)
        }
      }

      if (!isSelectionInContainer(document.getElementById(type))) {
        return
      }

      if (range) {
        const id = uuid()
        prevAddContent.current = {
          id,
          type,
          content: document.getElementById(type)?.innerHTML || ''
        }
        const { startContainer, endContainer } = range
        const commentIdClass = getCommentIdClass(id)
        // 检查选中的内容是否在同一个块级元素内
        const isSameBlock = startContainer.parentElement === endContainer.parentElement

        if (isSameBlock) {
          // 如果选中的内容在同一个块级元素内，直接用span包裹
          wrapRangeWithSpan(range, commentIdClass)
        } else {
          // 处理第一行和最后一行
          const startRange = range.cloneRange()
          const endRange = range.cloneRange()
          const startBlock =
            startContainer.nodeType === Node.ELEMENT_NODE && (startContainer as Element).matches(BLOCK_ELEMENTS)
              ? startContainer
              : startContainer.parentElement?.closest(BLOCK_ELEMENTS)

          const endBlock =
            endContainer.nodeType === Node.ELEMENT_NODE && (endContainer as Element).matches(BLOCK_ELEMENTS)
              ? endContainer
              : endContainer.parentElement?.closest(BLOCK_ELEMENTS)

          if (startBlock === endBlock) {
            // 如果开始和结束在同一个块级元素内
            const newRange = document.createRange()
            newRange.setStart(range.startContainer, range.startOffset)
            newRange.setEnd(range.endContainer, range.endOffset)
            wrapRangeWithSpan(newRange, commentIdClass)
          } else {
            // 处理第一行
            if (startBlock) {
              const newStartRange = document.createRange()
              newStartRange.setStart(range.startContainer, range.startOffset)
              newStartRange.setEnd(startBlock, startBlock.childNodes.length)
              wrapRangeWithSpan(newStartRange, commentIdClass)
            } else {
              wrapRangeWithSpan(startRange, commentIdClass)
            }

            // 处理最后一行
            if (endBlock) {
              const newEndRange = document.createRange()
              newEndRange.setStart(endBlock, 0)
              newEndRange.setEnd(range.endContainer, range.endOffset)
              wrapRangeWithSpan(newEndRange, commentIdClass)
            } else {
              wrapRangeWithSpan(endRange, commentIdClass)
            }
          }

          // 获取去除了第一行和最后一行后的选中元素
          const commonAncestor = range.commonAncestorContainer
          const middleNodes: Node[] = []

          // 遍历选中的范围，找到中间的元素
          const walker = document.createTreeWalker(commonAncestor, NodeFilter.SHOW_ALL, {
            acceptNode(node) {
              // 检查节点是否在选中的范围内
              if (!range.intersectsNode(node)) {
                return NodeFilter.FILTER_REJECT
              }

              // 排除第一行和最后一行
              if (
                node === startContainer ||
                node.contains(startContainer) ||
                node === endContainer ||
                node.contains(endContainer) ||
                node === startBlock ||
                node === endBlock
              ) {
                return NodeFilter.FILTER_REJECT
              }

              const isBlock =
                node.nodeType === Node.ELEMENT_NODE
                  ? window.getComputedStyle(node as Element).display.includes('block')
                  : false
              const isEmpty = isEmptyElement(node)

              // 只接受块级元素且是直接子元素
              if (node.parentNode === commonAncestor && isBlock && !isEmpty) {
                return NodeFilter.FILTER_ACCEPT
              }

              return NodeFilter.FILTER_SKIP
            }
          })

          while (walker.nextNode()) {
            middleNodes.push(walker.currentNode)
          }

          // 遍历中间的元素
          middleNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 创建新的span元素包裹原有内容
              const span = document.createElement('span')
              span.classList.add(IS_COMMENT_CLASS, commentIdClass)

              // 克隆原节点的所有内容
              const clonedContent = Array.from(node.childNodes).map(child => child.cloneNode(true))
              clonedContent.forEach(child => span.appendChild(child))

              // 清空原节点并添加新的span
              while (node.firstChild) {
                node.removeChild(node.firstChild)
              }
              node.appendChild(span)
            } else if (node.nodeType === Node.TEXT_NODE) {
              const span = document.createElement('span')
              span.classList.add(IS_COMMENT_CLASS, commentIdClass)
              const clonedNode = node.cloneNode(true)
              span.appendChild(clonedNode)
              node.parentNode!.replaceChild(span, node)
            }
          })
        }

        const commentIdsElemList = getContentElem()?.getElementsByClassName(getCommentIdClass(id))
        if (!commentIdsElemList?.length) return
        const rect = commentIdsElemList[0].getBoundingClientRect()
        const top = rect.top + window.scrollY - 40
        const left = rect.left + window.scrollX + rect.width / 2

        try {
          await showCommentConfirm({
            style: {
              left: `${left}px`,
              top: `${top}px`
            }
          })

          Array.from(commentIdsElemList).forEach(el => {
            el.classList.add(HIGHLIGHT_CLASS, HIGHLIGHT_ACTIVE_CLASS)
            el.addEventListener('click', e => {
              e.stopPropagation()
              handleCommentClick(id)
            })
          })

          onCommentIdChange(id)

          const commentElemList = getContentElem()?.getElementsByClassName(IS_COMMENT_CLASS)
          const index = Array.from(commentElemList || []).findIndex(elem =>
            elem.className.includes(getCommentIdClass(id))
          )
          onAddComment(index, {
            id,
            type,
            content: '',
            _isEdit: true
          })
          scrollToComment(id)
        } catch (error) {
          console.log('select cancel')
          removeComment(getCommentIdClass(id))
        }
      }
    },
    {
      wait: 200
    }
  )

  return {
    onSelect,
    removeComment
  }
}
