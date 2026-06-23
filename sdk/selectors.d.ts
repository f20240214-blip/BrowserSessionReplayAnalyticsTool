/**
 * escapeCssIdentifier escapes a string so it can be safely used as a CSS identifier.
 * This is important when IDs or data attribute values contain characters that are not
 * valid in CSS selectors or might be interpreted as special syntax.
 */
export declare function escapeCssIdentifier(value: string): string;
/**
 * isUniqueSelector tests whether a selector uniquely identifies one element
 * in the current document. Replay systems use this to validate generated selectors.
 */
export declare function isUniqueSelector(selector: string): boolean;
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
export declare function getElementSelector(element: HTMLElement): string;
//# sourceMappingURL=selectors.d.ts.map