import { Component, Element, h, Host, Prop } from '@stencil/core';
import { convertPropsToClasses } from './modus-wc-badge.tailwind';
import {
  captureEarlyHostText,
  type EarlyHostText,
  flushEarlyHostText,
  protectLightDomSlotContent,
  queryDirectChild,
} from '../../utils';
import { handleShadowDOMStyles } from '../base-component';
import { ModusSize } from '../types';
import { Attributes, inheritAriaAttributes } from '../utils';

const INNER_BADGE_SELECTOR = 'span.modus-wc-badge';
const ALERT_COLORS = ['success', 'warning', 'danger'];

/**
 * A customizable badge component used to create badges with different sizes, types, and colors.
 *
 * The component supports a `<slot>` for injecting content within the badge.
 */
@Component({
  tag: 'modus-wc-badge',
  styleUrl: 'modus-wc-badge.scss',
  shadow: false,
})
export class ModusWcBadge {
  private inheritedAttributes: Attributes = {};
  private queuedHostText?: EarlyHostText;
  private slotProtection?: ReturnType<typeof protectLightDomSlotContent>;

  /** Reference to the host element */
  @Element() el!: HTMLElement;

  /** The color variant of the badge. */
  @Prop() color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'high-contrast'
    | 'success'
    | 'warning'
    | 'danger' = 'primary';

  /** Custom CSS class to apply to the span element. */
  @Prop() customClass: string = '';

  /** The size of the badge. */
  @Prop() size: ModusSize = 'md';

  /** The variant of the badge. */
  @Prop() variant: 'counter' | 'filled' | 'outlined' | 'text' = 'filled';

  componentWillLoad() {
    this.captureEarlyHostText();
    handleShadowDOMStyles(this.el);
    this.inheritedAttributes = inheritAriaAttributes(this.el);
  }

  connectedCallback() {
    this.slotProtection?.release();
    this.slotProtection = protectLightDomSlotContent({
      host: this.el,
      getInner: () => queryDirectChild(this.el, INNER_BADGE_SELECTOR),
    });
    this.slotProtection.flush();
  }

  componentDidLoad() {
    this.flushEarlyHostText();
    this.slotProtection?.flush();
  }

  private captureEarlyHostText() {
    this.queuedHostText = captureEarlyHostText(
      this.el,
      Boolean(queryDirectChild(this.el, INNER_BADGE_SELECTOR))
    );
  }

  private flushEarlyHostText() {
    if (!this.queuedHostText) {
      return;
    }

    flushEarlyHostText(
      queryDirectChild(this.el, INNER_BADGE_SELECTOR),
      this.queuedHostText
    );
    this.queuedHostText = undefined;
  }

  disconnectedCallback() {
    this.slotProtection = undefined;
  }

  private getClasses(): string {
    const classList = ['modus-wc-badge'];
    const propClasses = convertPropsToClasses({
      color: this.color,
      size: this.size,
      variant: this.variant,
    });

    // The order CSS classes are added matters to CSS specificity
    if (propClasses) classList.push(propClasses);
    if (this.customClass) classList.push(this.customClass);

    return classList.join(' ');
  }

  render() {
    const isAlert = ALERT_COLORS.includes(this.color);
    // Use inherited role if provided, otherwise use default based on color
    const defaultRole = isAlert ? 'alert' : 'status';
    const role =
      'role' in this.inheritedAttributes
        ? this.inheritedAttributes.role
        : defaultRole;

    return (
      <Host>
        <span
          class={this.getClasses()}
          {...this.inheritedAttributes}
          role={role}
        >
          <slot />
        </span>
      </Host>
    );
  }
}
