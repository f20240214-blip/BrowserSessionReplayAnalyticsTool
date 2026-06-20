import { SnapshotEvent, SnapshotEventPayload } from './types'

const PASSWORD_MASK = '***'
const PRIVATE_MASK = '<div data-private="true">[REDACTED]</div>'

/**
 * captureSnapshot creates a snapshot event representing the full page state at the
 * moment recording begins. This baseline snapshot is used by replay logic to
 * reconstruct the page before applying subsequent mutation events.
 */
export function captureSnapshot(sessionId: string): SnapshotEvent {
  const snapshotDom = captureSanitizedDom()
  const payload: SnapshotEventPayload = {
    dom: snapshotDom,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
  }

  return {
    sessionId,
    timestamp: new Date().toISOString(),
    type: 'snapshot',
    payload,
  }
}

/**
 * captureSanitizedDom clones the document DOM and sanitizes it before serialization.
 *
 * Replay requirements:
 * - The initial snapshot must represent a clean, read-only baseline.
 * - Live page mutation must never occur while capturing state.
 * - Scripts are stripped to prevent unexpected execution during replay.
 * - Sensitive data is masked before it leaves the browser.
 */
function captureSanitizedDom(): string {
  const root = document.documentElement.cloneNode(true) as HTMLElement

  removeScriptElements(root)
  maskSensitiveInputs(root)
  maskPrivateElements(root)

  return root.outerHTML
}

/**
 * removeScriptElements strips <script> and <noscript> elements from the cloned DOM.
 * Scripts are not part of replay state and may introduce security or execution risks.
 */
function removeScriptElements(root: HTMLElement): void {
  const selectors = ['script', 'noscript']
  const elements = root.querySelectorAll(selectors.join(','))
  elements.forEach((element) => element.remove())
}

/**
 * maskSensitiveInputs hides password input values in the snapshot.
 * This prevents leaking typed credentials while preserving the DOM structure.
 */
function maskSensitiveInputs(root: HTMLElement): void {
  const passwordInputs = root.querySelectorAll('input[type="password"]')

  passwordInputs.forEach((input) => {
    if (input instanceof HTMLInputElement) {
      input.value = PASSWORD_MASK
      input.setAttribute('value', PASSWORD_MASK)
    }
  })
}

/**
 * maskPrivateElements replaces elements marked with data-private to prevent
 * exporting private content in the baseline snapshot.
 */
function maskPrivateElements(root: HTMLElement): void {
  const privateNodes = root.querySelectorAll('[data-private]')

  privateNodes.forEach((node) => {
    if (node instanceof HTMLElement) {
      const replacement = document.createElement('div')
      replacement.setAttribute('data-private', 'true')
      replacement.textContent = '[REDACTED]'
      node.replaceWith(replacement)
    }
  })
}
