import { ChevronLeftIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import If from 'components/If';
import React, {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import SectionHeader from '../SectionHeader/SectionHeader';
import styles from './Carousel.module.scss';

type Props = {
  headline?: string;
  gap?: number;
  minItemWidth?: number;
  teaserWidth?: number;
  headerContent?: ReactElement;
};

type State = {
  itemWidth: number;
  itemsPerPage: number;
  trackWidth: number;
};

enum Direction {
  LEFT = -1,
  RIGHT = 1,
}

function Carousel({
  children,
  headline,
  gap = 16,
  minItemWidth = 140,
  teaserWidth = 32,
  headerContent,
}: PropsWithChildren<Props>): ReactElement {
  const rootElRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<State>({
    itemWidth: 0,
    itemsPerPage: 0,
    trackWidth: 0,
  });

  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const updateNav = useCallback(() => {
    const { current: rootEl } = rootElRef;
    const { current: viewport } = viewportRef;
    const { trackWidth } = state;

    if (rootEl && viewport) {
      setHasPrevious(viewport.scrollLeft > 0);
      setHasNext(
        viewport.scrollLeft <=
          trackWidth - rootEl.getBoundingClientRect().width,
      );
    }
  }, [state]);

  const recalculate = useCallback(() => {
    const { current: rootEl } = rootElRef;

    if (rootEl) {
      const availableWidth = rootEl.getBoundingClientRect().width;

      let itemsPerPage = calcItemsPerPage({ availableWidth, minItemWidth });
      let requiredWidth = calcRequiredWidth({
        gap,
        itemsPerPage,
        minItemWidth,
        teaserWidth,
      });

      while (requiredWidth > availableWidth) {
        itemsPerPage -= 1;
        requiredWidth = calcRequiredWidth({
          gap,
          itemsPerPage,
          minItemWidth,
          teaserWidth,
        });
      }

      const remainingWidth = availableWidth - requiredWidth;
      const itemWidth = minItemWidth + remainingWidth / itemsPerPage;

      const itemCount = React.Children.count(children);
      const trackWidth = itemCount * itemWidth + (itemCount - 2) * gap;

      setState({
        itemWidth,
        itemsPerPage,
        trackWidth,
      });
      rootEl.style.setProperty('--itemWidth', `${itemWidth}px`);
      rootEl.style.setProperty('--gap', `${gap}px`);
      rootEl.style.setProperty('--padding', `${teaserWidth}px`);
      rootEl.style.setProperty('--trackWidth', `${trackWidth}px`);
    }
  }, [rootElRef, gap, minItemWidth, teaserWidth, children]);

  function navigate(direction: Direction) {
    const { current: viewport } = viewportRef;

    if (viewport) {
      const { itemWidth, itemsPerPage } = state;
      let scrollAmount = itemsPerPage * (itemWidth + gap);

      const isAtEitherEnd = !hasNext || !hasPrevious;
      if (isAtEitherEnd) {
        scrollAmount -= 2 * gap;
      }

      viewport.scrollBy({
        left: scrollAmount * direction,
        behavior: 'smooth',
      });
    }
  }

  function onPrevious() {
    navigate(Direction.LEFT);
  }

  function onNext() {
    navigate(Direction.RIGHT);
  }

  useEffect(() => {
    function handleResize() {
      recalculate();
    }

    window.addEventListener('resize', handleResize);

    recalculate();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [recalculate]);

  useEffect(() => {
    updateNav();
  }, [updateNav]);

  return (
    <div ref={rootElRef} className={styles.root}>
      <header>
        {headline && <SectionHeader headline={headline} />}
        {headerContent}
        <If condition={hasPrevious || hasNext}>
          <nav>
            <CarouselButton onClick={onPrevious} disabled={!hasPrevious} />
            <CarouselButton onClick={onNext} mirrored disabled={!hasNext} />
          </nav>
        </If>
      </header>
      <div ref={viewportRef} onScroll={updateNav} className={styles.viewport}>
        <div className={styles.track}>{children}</div>
      </div>
    </div>
  );
}

type CarouselButtonProps = {
  onClick?: () => void;
  mirrored?: boolean;
  disabled?: boolean;
};

function CarouselButton(props: CarouselButtonProps) {
  return <IconButton icon={<ChevronLeftIcon />} {...props} />;
}

function calcItemsPerPage({
  availableWidth,
  minItemWidth,
}: {
  availableWidth: number;
  minItemWidth: number;
}): number {
  return Math.floor(availableWidth / minItemWidth);
}

function calcRequiredWidth({
  itemsPerPage,
  minItemWidth,
  gap,
  teaserWidth,
}: {
  itemsPerPage: number;
  minItemWidth: number;
  gap: number;
  teaserWidth: number;
}): number {
  const totalGap = (itemsPerPage - 1) * gap;
  return itemsPerPage * minItemWidth + totalGap + teaserWidth * 2;
}

export default Carousel;
