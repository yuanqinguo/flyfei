import { delay } from '@/utils'
import { useEffect, useRef, useState } from 'react'

export const IS_COMMENT_CLASS = 'is-comment'
export const HIGHLIGHT_CLASS = 'highlight'
export const HIGHLIGHT_ACTIVE_CLASS = 'highlight--active'
export const COMMENT_PREFIX = 'comment-id-'

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

export const getCommentIdByClass = (className: string) => className.trim().replace(/^comment-id-/, '')

export const useCommentId = (ref: React.RefObject<HTMLDivElement>, onClick?: (commentId: string, e: Event) => void) => {
  const [commentId, set] = useState<string>('')
  const isBind = useRef(false)

  const handleCommentClick = (e: any) => {
    // @ts-ignore
    Array.from(e.currentTarget?.classList).forEach((className: string) => {
      if (className.startsWith(COMMENT_PREFIX)) {
        const id = getCommentIdByClass(className)
        setTimeout(() => {
          // @ts-ignore
          setCommentId(id)
          onClick?.(id, e)
        }, 50)
      }
    })
  }

  const bindEvent = async () => {
    await delay(300)
    if (isBind.current) return
    if (ref.current) {
      isBind.current = true
    }
    const commentsElem = ref.current?.querySelectorAll(`.${IS_COMMENT_CLASS}`)
    if (commentsElem) {
      Array.from(commentsElem).forEach((item: any) => {
        item.addEventListener('click', handleCommentClick)
      })
    }
  }

  const unbindEvent = () => {
    if (!isBind.current) return
    isBind.current = false
    const commentsElem = ref.current?.querySelectorAll(`.${IS_COMMENT_CLASS}`)
    if (commentsElem) {
      Array.from(commentsElem).forEach((item: any) => {
        item.removeEventListener('click', handleCommentClick)
      })
    }
  }

  useEffect(() => {
    bindEvent()

    return () => {
      unbindEvent()
    }
  }, [])

  const setCommentId = async (id: string) => {
    set(id)
    Array.from(ref.current?.querySelectorAll(`.${IS_COMMENT_CLASS}`) as any).map((item: any) => {
      if (id && item.className.includes(id)) {
        if (!item.classList.contains(HIGHLIGHT_ACTIVE_CLASS)) {
          item.classList.add(HIGHLIGHT_ACTIVE_CLASS)
        }
      } else {
        item.classList.remove(HIGHLIGHT_ACTIVE_CLASS)
      }
    })
  }

  return {
    commentId,
    setCommentId,
    bindEvent,
    unbindEvent
  }
}
