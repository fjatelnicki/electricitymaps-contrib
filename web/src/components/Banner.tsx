type BannerTypeOptions = 'informational';

export interface BannerProps {
  height?: 'slim';
  backgroundColor?: BannerTypeOptions;
  children: React.ReactNode;
}

export function Banner({
  height = 'slim',
  backgroundColor = 'informational',
  children,
}: BannerProps) {
  return (
    <div className={`sticky ${getBackground(backgroundColor)} ${getHeight(height)}`}>
      {children}
    </div>
  );
}

function getBackground(type: string) {
  switch (type) {
    case 'informational': {
      return 'bg-neutral-100 border-solid border-b-[1px] border-neutral-300';
    }

    default: {
      return 'bg-inherit';
    }
  }
}

function getHeight(type: string) {
  switch (type) {
    case 'slim': {
      return 'h-12 min-h-12';
    }
    default: {
      return 'h-12 min-h-12';
    }
  }
}
