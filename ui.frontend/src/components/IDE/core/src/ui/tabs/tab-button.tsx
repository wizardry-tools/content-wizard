import { forwardRef, type JSX } from 'react';
import { clsx } from 'clsx';
import { UnStyledButton } from '../unstyled-button';

export const TabButton = forwardRef<HTMLButtonElement, JSX.IntrinsicElements['button']>((props, ref) => (
  <UnStyledButton {...props} ref={ref} type="button" className={clsx('wizard-tab-button', props.className)}>
    {props.children}
  </UnStyledButton>
));
TabButton.displayName = 'Tab.Button';
