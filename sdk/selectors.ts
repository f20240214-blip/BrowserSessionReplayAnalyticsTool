const STABLE_ATTRIBUTE_SELECTORS = ['data-testid', 'data-track-id', 'data-replay-id']

/**
 * escapeCssIdentifier escapes a string so it can be safely used as a CSS identifier.
 * This is important when IDs or data attribute values contain characters that are not
 * valid in CSS selectors or might be interpreted as special syntax.
 */
export function escapeCssIdentifier(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }

  return value.replace(/(["'!#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1')
}

/**
 * isUniqueSelector tests whether a selector uniquely identifies one element
 * in the current document. Replay systems use this to validate generated selectors.
 */
export function isUniqueSelector(selector: string): boolean {
  try {
    const elements = document.querySelectorAll(selector)
    return elements.length === 1
  } catch {
    return false
  }
}

/**
 * getElementSelector returns a stable selector for the provided element.
 * It prefers IDs, then stable data attributes, then a fallback path built from
 * element ancestry using nth-child selectors.
 *
 * Selector stability tradeoffs:
 * - IDs are ideal because they are short and usually stable.
 * - Stable data attributes are next best because they can be explicitly controlled
 *   by developers for replay use.
 * - nth-child paths are brittle, but necessary when no stable identifier exists.
 *   They should be minimized and only used as a last resort.
 */
export function getElementSelector(element: HTMLElement): string {
  if (element.id) {
    const selector = `#${escapeCssIdentifier(element.id)}`
    if (isUniqueSelector(selector)) {
      return selector
    }
  }

  for (const attribute of STABLE_ATTRIBUTE_SELECTORS) {
    const value = element.getAttribute(attribute)
    if (value) {
      const selector = `[${attribute}="${escapeCssIdentifier(value)}"]`
      if (isUniqueSelector(selector)) {
        return selector
      }
    }
  }

  return buildUniquePath(element)
}

/**
 * buildUniquePath creates a unique selector path by walking from the element up to
 * the document root. It uses tag names and nth-child positions to remain precise.
 */
function buildUniquePath(element: HTMLElement): string {
  const pathSegments: string[] = []
  let current: HTMLElement | null = element

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    const tag = current.tagName.toLowerCase()

    if (current.id) {
      pathSegments.unshift(`#${escapeCssIdentifier(current.id)}`)
      break
    }

    const stableAttribute = findStableAttribute(current)
    if (stableAttribute) {
      pathSegments.unshift(stableAttribute)
      break
    }

    const siblingIndex = getNthChildIndex(current)
    const segment = siblingIndex > 0 ? `${tag}:nth-child(${siblingIndex})` : tag
    pathSegments.unshift(segment)
    current = current.parentElement
  }

  const selector = pathSegments.join(' > ')
  if (!isUniqueSelector(selector)) {
    return selector
  }

  return selector
}

/**
 * findStableAttribute returns a stable selector segment for an element with a
 * preferred stable attribute if one exists.
 */
function findStableAttribute(element: HTMLElement): string | null {
  for (const attribute of STABLE_ATTRIBUTE_SELECTORS) {
    const value = element.getAttribute(attribute)
    if (value) {
      return `[${attribute}="${escapeCssIdentifier(value)}"]`
    }
  }
  return null
}

/**
 * getNthChildIndex returns the 1-based position of the element among its
 * element siblings. This is used to generate precise child selectors.
 */
function getNthChildIndex(element: HTMLElement): number {
  const parent = element.parentElement
  if (!parent) {
    return 0
  }

  let index = 0
  let sibling: Element | null = parent.firstElementChild
  while (sibling) {
    index += 1
    if (sibling === element) {
      return index
    }
    sibling = sibling.nextElementSibling
  }

  return 0
}
