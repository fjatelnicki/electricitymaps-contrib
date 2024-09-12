import LoadingSpinner from 'components/LoadingSpinner';
import Logo from 'features/header/Logo';
import { loadingMapAtom } from 'features/map/mapAtoms';
import MobileButtons from 'features/map-controls/MobileButtons';
import { useAtom } from 'jotai';
import { ChevronLeft, ChevronRight, Share2Icon } from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { BottomSheet } from 'react-spring-bottom-sheet';
import { useScreenshot } from 'use-react-screenshot';
import { hasOnboardingBeenSeenAtom } from 'utils/state/atoms';
import { useIsMobile } from 'utils/styling';

import { leftPanelOpenAtom, screenshotAtom } from './panelAtoms';

const RankingPanel = lazy(() => import('./ranking-panel/RankingPanel'));
const ZoneDetails = lazy(() => import('./zone/ZoneDetails'));

const handleShareClick = async () => {
  try {
    // Fetch the local image (adjust the path to your image)
    const response = await fetch('/path/to/your/image.png');
    const blob = await response.blob();
    console.log(blob);

    // Check if the clipboard API and ClipboardItem are available
    if (navigator.clipboard && window.ClipboardItem) {
      const clipboardItem = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([clipboardItem]);

      alert('Screenshot copied to clipboard!');
    } else {
      alert('Clipboard API not supported');
    }
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
  }
};

function HandleLegacyRoutes() {
  const [searchParameters] = useSearchParams();

  const page = (searchParameters.get('page') || 'map')
    .replace('country', 'zone')
    .replace('highscore', 'ranking');
  searchParameters.delete('page');

  const zoneId = searchParameters.get('countryCode');
  searchParameters.delete('countryCode');

  return (
    <Navigate
      to={{
        pathname: zoneId ? `/zone/${zoneId}` : `/${page}`,
        search: searchParameters.toString(),
      }}
    />
  );
}

function ValidZoneIdGuardWrapper({ children }: { children: JSX.Element }) {
  const [searchParameters] = useSearchParams();
  const { zoneId } = useParams();

  if (!zoneId) {
    return <Navigate to="/" replace />;
  }

  // Handle legacy Australia zone names
  if (zoneId.startsWith('AUS')) {
    return (
      <Navigate to={`/zone/${zoneId.replace('AUS', 'AU')}?${searchParameters}`} replace />
    );
  }
  const upperCaseZoneId = zoneId.toUpperCase();
  if (zoneId !== upperCaseZoneId) {
    return <Navigate to={`/zone/${upperCaseZoneId}?${searchParameters}`} replace />;
  }

  return children;
}

type CollapseButtonProps = {
  isCollapsed: boolean;
  onCollapse: () => void;
};

function CollapseButton({ isCollapsed, onCollapse }: CollapseButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      data-test-id="left-panel-collapse-button"
      className={
        'absolute left-full top-2 z-10 flex h-12 w-10 cursor-pointer items-center justify-center rounded-r-xl bg-zinc-50 shadow-[6px_2px_10px_-3px_rgba(0,0,0,0.1)] hover:bg-zinc-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
      }
      onClick={onCollapse}
      aria-label={
        isCollapsed ? t('aria.label.showSidePanel') : t('aria.label.hideSidePanel')
      }
    >
      {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
    </button>
  );
}

function ShareButton({
  panelReference,
}: {
  panelReference: React.RefObject<HTMLElement>;
}) {
  const [, takeScreenshot] = useScreenshot();
  const [screenshot, setScreenshot] = useState<string | null>(null); // Store screenshot

  const captureScreenshot = async () => {
    if (panelReference.current) {
      const img = await takeScreenshot(panelReference.current);
      setScreenshot(img);
      console.log('Screenshot captured:', img);
      return img;
    }
  };

  return (
    <div>
      <button
        onClick={captureScreenshot}
        className={
          'absolute right-0 top-96 z-10 flex h-12 w-10 cursor-pointer items-center justify-center rounded-l-xl border-b-2 border-l-2 border-t-2 border-zinc-300 bg-zinc-50 shadow-[6px_2px_10px_-3px_rgba(0,0,0,0.1)] hover:bg-zinc-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
        }
        aria-label={'aria.label.showSidePanel'}
      >
        <Share2Icon />
      </button>
      {/* Conditionally render the screenshot */}
      {screenshot && (
        <div style={{ marginTop: '20px' }}>
          <h3>Captured Screenshot:</h3>
          <img
            src={screenshot}
            alt="Screenshot"
            style={{ maxWidth: '100%', border: '1px solid #ccc' }}
          />
        </div>
      )}
    </div>
  );
}

function MobileHeader() {
  return (
    <div className="mt-[env(safe-area-inset-top)] flex w-full items-center justify-between pl-1 dark:bg-gray-900">
      <Logo className="h-10 w-44 fill-black dark:fill-white" />
      <MobileButtons />
    </div>
  );
}

function OuterPanel({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useAtom(leftPanelOpenAtom);
  const location = useLocation();
  const isMobile = useIsMobile();
  const panelReference = useRef<HTMLDivElement>(null);
  const [, takeScreenshot] = useScreenshot();
  const [screenshot, setScreenshot] = useAtom(screenshotAtom); // Store screenshot

  const captureScreenshot = async () => {
    if (panelReference.current) {
      const img = await takeScreenshot(panelReference.current);
      setScreenshot(img);
      console.log('Screenshot captured:', img);
      return img;
    }
  };

  const onCollapse = () => setOpen(!isOpen);

  const [isLoadingMap] = useAtom(loadingMapAtom);
  const [hasOnboardingBeenSeen] = useAtom(hasOnboardingBeenSeenAtom);
  const safeAreaBottomString = getComputedStyle(
    document.documentElement
  ).getPropertyValue('--sab');

  const safeAreaBottom = safeAreaBottomString
    ? Number.parseInt(safeAreaBottomString.replace('px', ''))
    : 0;
  const SNAP_POINTS = [60 + safeAreaBottom, 460 + safeAreaBottom];
  const snapPoints = hasOnboardingBeenSeen && !isLoadingMap ? SNAP_POINTS : [0, 0];

  console.log('panel ref', panelReference);

  return (
    <aside
      data-test-id="left-panel"
      ref={panelReference}
      className={`absolute left-0 top-0 z-20 h-full w-full bg-zinc-50 shadow-xl transition-all duration-500 dark:bg-gray-900 dark:[color-scheme:dark] sm:flex sm:w-[calc(14vw_+_16rem)] ${
        location.pathname === '/map' ? 'hidden' : ''
      } ${isOpen ? '' : '-translate-x-full'}`}
    >
      {isMobile && <MobileHeader />}
      <section className="h-full w-full">{children}</section>

      <div className="left-full top-2 flex flex-col space-y-20">
        <div>
          <button
            onClick={captureScreenshot}
            className={
              'absolute right-0 top-96 z-10 flex h-12 w-10 cursor-pointer items-center justify-center rounded-l-xl border-b-2 border-l-2 border-t-2 border-zinc-300 bg-zinc-50 shadow-[6px_2px_10px_-3px_rgba(0,0,0,0.1)] hover:bg-zinc-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
            }
            aria-label={'aria.label.showSidePanel'}
          >
            <Share2Icon />
          </button>
        </div>
        <CollapseButton isCollapsed={!isOpen} onCollapse={onCollapse} />
        {screenshot && (
          <BottomSheet
            scrollLocking={false} // Ensures scrolling is not blocked on IOS
            open={!isLoadingMap}
            snapPoints={() => snapPoints}
            blocking={true}
            header={<div />}
            style={{ zIndex: 10_000 }}
          >
            <div className="overflow-auto p-2 min-[370px]:px-4 ">
              <h3>Captured Screenshot:</h3>
              <img
                src={screenshot}
                alt="Screenshot"
                className="max-w-full overflow-scroll border-2 border-gray-300"
              />
            </div>
          </BottomSheet>
        )}
      </div>
    </aside>
  );
}

export default function LeftPanel() {
  return (
    <OuterPanel>
      <Routes>
        <Route path="/" element={<HandleLegacyRoutes />} />
        <Route
          path="/zone/:zoneId"
          element={
            <ValidZoneIdGuardWrapper>
              <Suspense fallback={<LoadingSpinner />}>
                <ZoneDetails />
              </Suspense>
            </ValidZoneIdGuardWrapper>
          }
        />
        {/* Alternative: add /map here and have a NotFound component for anything else*/}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <RankingPanel />
            </Suspense>
          }
        />
      </Routes>
    </OuterPanel>
  );
}
