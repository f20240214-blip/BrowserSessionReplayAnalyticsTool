import { MutationEvent, MutationEventPayload } from './types'
import { getElementSelector } from './selectors'

/**
 * startMutationTracking observes DOM changes after the initial snapshot and
 * converts MutationRecords into serializable MutationEvent objects for replay.
 *
 * The MutationObserver watches for:
 * - childList changes (nodes added/removed)
 * - attribute changes (including style)
 * - characterData changes (text node updates)
 *
 * Mutations from <script> and <noscript> elements are ignored because they are
 * not part of the page structure that replay systems need to reconstruct.
 *
 * Returns a cleanup function that disconnects the observer.
 */
export function startMutationTracking(
  sessionId: string,
  onEvent: (event: MutationEvent) => void,
): () => void {
  const observer = new MutationObserver((records) => {
    processMutationBatch(sessionId, records, onEvent)
  })

  const observerConfig: MutationObserverInit = {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true,
  }

  observer.observe(document.documentElement, observerConfig)

  return (): void => {
    observer.disconnect()
  }
}

/**
 * processMutationBatch converts a batch of MutationRecords into MutationEvents
 * and invokes the callback for each. Mutations from excluded elements are skipped.
 */
function processMutationBatch(
  sessionId: string,
  records: MutationRecord[],
  onEvent: (event: MutationEvent) => void,
): void {
  for (const record of records) {
    const events = convertMutationRecord(sessionId, record)
    for (const event of events) {
      onEvent(event)
    }
  }
}

/**
 * convertMutationRecord converts a single MutationRecord into zero or more
 * MutationEvent objects. A single record can generate multiple events.
 * For example, a childList mutation adds multiple nodes could generate
 * one event per node group.
 */
function convertMutationRecord(sessionId: string, record: MutationRecord): MutationEvent[] {
  if (shouldIgnoreMutation(record)) {
    return []
  }

  if (record.type === 'attributes') {
    return [createAttributeMutation(sessionId, record)]
  }

  if (record.type === 'characterData') {
    return [createCharacterDataMutation(sessionId, record)]
  }

  if (record.type === 'childList') {
    return createChildListMutations(sessionId, record)
  }

  return []
}

/**
 * shouldIgnoreMutation returns true if the mutation should be skipped.
 * Scripts and noscript elements are ignored because they are not part of
 * the observable page structure.
 */
function shouldIgnoreMutation(record: MutationRecord): boolean {
  const target = record.target
  if (!(target instanceof HTMLElement)) {
    return true
  }

  const tagName = target.tagName.toLowerCase()
  if (tagName === 'script' || tagName === 'noscript') {
    return true
  }

  if (record.type === 'childList') {
    for (const node of record.addedNodes) {
      if (node instanceof HTMLElement) {
        const nodeName = node.tagName.toLowerCase()
        if (nodeName === 'script' || nodeName === 'noscript') {
          continue
        }
        return false
      }
    }

    for (const node of record.removedNodes) {
      if (node instanceof HTMLElement) {
        const nodeName = node.tagName.toLowerCase()
        if (nodeName === 'script' || nodeName === 'noscript') {
          continue
        }
        return false
      }
    }

    return true
  }

  return false
}

/**
 * createAttributeMutation converts an attribute MutationRecord into a MutationEvent.
 */
function createAttributeMutation(sessionId: string, record: MutationRecord): MutationEvent {
  const target = record.target as HTMLElement
  const selector = getElementSelector(target)

  const payload: MutationEventPayload = {
    mutationType: 'attributes',
    targetSelector: selector,
    attributeName: record.attributeName ?? undefined,
    oldValue: record.oldValue,
    newValue: target.getAttribute(record.attributeName ?? ''),
  }

  return {
    sessionId,
    timestamp: new Date().toISOString(),
    type: 'mutation',
    payload,
  }
}

/**
 * createCharacterDataMutation converts a characterData MutationRecord into a MutationEvent.
 */
function createCharacterDataMutation(sessionId: string, record: MutationRecord): MutationEvent {
  const target = record.target
  const selector = getElementSelector(target.parentElement as HTMLElement)

  const payload: MutationEventPayload = {
    mutationType: 'characterData',
    targetSelector: selector,
    oldValue: record.oldValue,
    newValue: target.textContent,
  }

  return {
    sessionId,
    timestamp: new Date().toISOString(),
    type: 'mutation',
    payload,
  }
}

/**
 * createChildListMutations converts a childList MutationRecord into one or more
 * MutationEvent objects. One event is created per mutation record since added
 * and removed nodes are tracked in the record.
 */
function createChildListMutations(sessionId: string, record: MutationRecord): MutationEvent[] {
  const target = record.target as HTMLElement
  const selector = getElementSelector(target)

  const addedNodeSelectors = Array.from(record.addedNodes)
    .filter((node) => node instanceof HTMLElement)
    .map((node) => getElementSelector(node as HTMLElement))

  const removedNodeSelectors = Array.from(record.removedNodes)
    .filter((node) => node instanceof HTMLElement)
    .map((node) => getElementSelector(node as HTMLElement))

  if (addedNodeSelectors.length === 0 && removedNodeSelectors.length === 0) {
    return []
  }

  const payload: MutationEventPayload = {
    mutationType: 'childList',
    targetSelector: selector,
    addedNodes: addedNodeSelectors.length > 0 ? addedNodeSelectors : undefined,
    removedNodes: removedNodeSelectors.length > 0 ? removedNodeSelectors : undefined,
  }

  return [
    {
      sessionId,
      timestamp: new Date().toISOString(),
      type: 'mutation',
      payload,
    },
  ]
}
