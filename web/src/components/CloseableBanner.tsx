import { X } from 'lucide-react';

import { Banner, BannerProps } from './Banner';

export interface CloseableBannerProps extends BannerProps {
  onClose(): void;
  open: boolean;
  CloseButton?({ onClose }: DefaultCloseButtonProps): React.ReactNode;
}

export function CloseableBanner({
  onClose,
  CloseButton = DefaultCloseButton,
  open,
  children,
  ...rest
}: CloseableBannerProps) {
  // TODO: handle open
  return (
    <Banner {...rest}>
      <div className="flex h-full w-full px-3">
        <CloseButton onClose={onClose} />
        {children}
      </div>
    </Banner>
  );
}

export interface DefaultCloseButtonProps {
  onClose(): void;
}

export function DefaultCloseButton({ onClose }: DefaultCloseButtonProps) {
  return (
    <button
      onClick={onClose}
      className="pointer-events-auto flex h-6 w-6 items-center justify-center self-center pr-2 text-neutral-400 "
    >
      <X />
    </button>
  );
}
