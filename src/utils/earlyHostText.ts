/**
 * Text that landed on the host before the inner chrome exists.
 *
 * Frameworks may set `host.textContent` or insert a text node between
 * `connectedCallback` and the first render. Stencil may also insert a comment
 * marker beside that text. Comment nodes are ignored so they stay on the host.
 * The original `Text` node is kept so later `nodeValue` updates (Vue / Angular
 * interpolation) still change what the control shows.
 */
export type EarlyHostText = {
  textNode?: Text;
  text: string;
};

export function captureEarlyHostText(
  host: HTMLElement,
  innerAlreadyPresent: boolean
): EarlyHostText | undefined {
  if (innerAlreadyPresent) {
    return undefined;
  }

  const contentNodes = Array.from(host.childNodes).filter(
    (node) => node.nodeType !== Node.COMMENT_NODE
  );

  if (
    contentNodes.length !== 1 ||
    contentNodes[0].nodeType !== Node.TEXT_NODE
  ) {
    return undefined;
  }

  const textNode = contentNodes[0] as Text;
  const text = textNode.textContent ?? '';
  textNode.remove();

  return { textNode, text };
}

export function flushEarlyHostText(
  inner: Element | null,
  queued: EarlyHostText | undefined
): void {
  if (!queued || !inner) {
    return;
  }

  if (queued.textNode) {
    inner.appendChild(queued.textNode);
    return;
  }

  inner.textContent = queued.text;
}
