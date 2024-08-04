import { forwardRef, type JSX } from 'react';
import { clsx } from 'clsx';
import { CloseIcon } from '@/icons';
import { UnStyledButton } from '../unstyled-button';
import { Tooltip } from '../tooltip';

export const TabClose = forwardRef<HTMLButtonElement, JSX.IntrinsicElements['button']>((props, ref) => (
  <Tooltip label="Close Tab">
    <UnStyledButton
      aria-label="Close Tab"
      {...props}
      ref={ref}
      type="button"
      className={clsx('wizard-tab-close', props.className)}
    >
      <CloseIcon />
    </UnStyledButton>
  </Tooltip>
));
TabClose.displayName = 'Tab.Close';
