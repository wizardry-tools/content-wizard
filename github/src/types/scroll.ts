import { PropsWithChildren } from 'react';
import { MenuItemProps } from '@mui/material/MenuItem/MenuItem';
import { ButtonProps } from '@mui/material/Button/Button';

export type ScrollToIdProps = {
  scrollToOptions?: ScrollToOptions;
  scrollIntoViewOptions?: ScrollIntoViewOptions;
  hook?: (callbackValue: unknown) => void;
  hookProps?: unknown;
  offset?: number;
};

export type ScrollLinkProps = ScrollToIdProps &
  PropsWithChildren & {
    scrollId: string;
  };

export type ScrollMenuItemProps = ScrollLinkProps & MenuItemProps;
export type ScrollButtonProps = ScrollLinkProps & ButtonProps;
