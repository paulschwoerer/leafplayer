import classNames from 'classnames';
import React, { ReactElement, ReactNode, useState } from 'react';
import styles from './Slider.module.scss';

type Props = {
  value: number;
  onDragStart?: (value: number) => void;
  onDragRelease?: (value: number) => void;
  onDragUpdate?: (value: number) => void;
  disabled?: boolean;
  before?: (props: { isDragging: boolean; dragValue: number }) => ReactNode;
  after?: (props: { isDragging: boolean; dragValue: number }) => ReactNode;
  rangeOverlay?: () => ReactNode;
};

function calculateValue(pointerX: number, referenceEl: HTMLElement): number {
  return Math.min(
    1,
    Math.max(
      0,
      (pointerX - referenceEl.getBoundingClientRect().left) /
        referenceEl.scrollWidth,
    ),
  );
}

function Slider({
  value,
  onDragStart,
  onDragRelease,
  onDragUpdate,
  disabled,
  before,
  after,
  rangeOverlay,
}: Props): ReactElement {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  function onPointerDown(ev: React.PointerEvent<HTMLDivElement>): void {
    if (disabled) {
      return;
    }

    ev.currentTarget.setPointerCapture(ev.pointerId);

    const value = calculateValue(ev.clientX, ev.currentTarget);

    onDragStart && onDragStart(value);
    onDragUpdate && onDragUpdate(value);

    setDragValue(value);
    setIsDragging(true);
  }

  function onPointerMove(ev: React.PointerEvent<HTMLDivElement>): void {
    if (!isDragging) {
      return;
    }

    const value = calculateValue(ev.clientX, ev.currentTarget);

    onDragUpdate && onDragUpdate(value);

    setDragValue(value);
  }

  function onPointerUp(ev: React.PointerEvent<HTMLDivElement>): void {
    if (!isDragging) {
      return;
    }

    const value = calculateValue(ev.clientX, ev.currentTarget);

    onDragUpdate && onDragUpdate(value);
    onDragRelease && onDragRelease(value);

    setIsDragging(false);
  }

  const valuePercent = (isDragging ? dragValue : value) * 100;

  return (
    <div
      className={classNames(styles.root, {
        [styles.isDragging]: isDragging,
        [styles.disabled]: disabled,
      })}
    >
      {before && (
        <div className={styles.before}>{before({ isDragging, dragValue })}</div>
      )}
      <div
        className={styles.dragContainer}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className={styles.range}>
          {rangeOverlay && rangeOverlay()}
          <span
            className={styles.value}
            style={{ width: `${valuePercent}%` }}
          />
          <span className={styles.knob} style={{ left: `${valuePercent}%` }} />
        </div>
      </div>
      {after && (
        <div className={styles.after}>{after({ isDragging, dragValue })}</div>
      )}
    </div>
  );
}

export default Slider;
