import { EmapsIcon } from 'icons/emapsIcon';

import { Button } from './Button';
import { CloseableBanner } from './CloseableBanner';

export interface AppStoreBannerProps {}

export function AppStoreBanner() {
  return (
    <CloseableBanner open={true} onClose={() => console.log('onclose')}>
      <div className="flex h-full w-full items-center">
        <div className="flex flex-grow gap-2">
          <div className="items-center justify-center self-center rounded-md border-[1px] border-neutral-200 bg-white">
            <EmapsIcon size={40} />
          </div>
          {BannerCopy}
        </div>
        <div className="flex h-9">
          <Button size="md" shouldShrink>
            Get the app
          </Button>
        </div>
      </div>
    </CloseableBanner>
  );
}

const BannerCopy = (
  <div className="content-center font-inter text-neutral-600">
    <div className="text-sm font-semibold">Electricity Maps</div>
    <div className="text-xs">Live electricity data</div>
  </div>
);
