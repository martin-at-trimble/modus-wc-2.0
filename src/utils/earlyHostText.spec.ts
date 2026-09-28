import { captureEarlyHostText, flushEarlyHostText } from './earlyHostText';

describe('earlyHostText', () => {
  it('should ignore comment nodes and keep the same text node', () => {
    const host = document.createElement('div');
    const comment = document.createComment('stencil');
    const text = document.createTextNode('Hi');
    host.append(comment, text);

    const queued = captureEarlyHostText(host, false);

    expect(queued?.text).toBe('Hi');
    expect(queued?.textNode).toBe(text);
    expect(host.contains(comment)).toBe(true);
    expect(host.contains(text)).toBe(false);

    const inner = document.createElement('button');
    flushEarlyHostText(inner, queued);
    text.nodeValue = 'X';

    expect(inner.textContent).toBe('X');
    expect(text.parentNode).toBe(inner);
  });

  it('should skip capture when the host has more than text and comments', () => {
    const host = document.createElement('div');
    host.append(
      document.createComment('stencil'),
      document.createTextNode('Hi')
    );
    host.appendChild(document.createElement('span'));

    expect(captureEarlyHostText(host, false)).toBeUndefined();
  });

  it('should skip capture when inner chrome already exists', () => {
    const host = document.createElement('div');
    host.appendChild(document.createTextNode('Hi'));

    expect(captureEarlyHostText(host, true)).toBeUndefined();
    expect(host.textContent).toBe('Hi');
  });
});
