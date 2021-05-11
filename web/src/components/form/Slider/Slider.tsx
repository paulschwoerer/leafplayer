import classNames from 'classnames';
import { clamp } from 'helpers/math';
import React, { PropsWithChildren, ReactElement } from 'react';
import styles from './Slider.module.scss';

type Props = {
  value: number;
  isDragging: boolean;
  disabled?: boolean;
  onDragStart: (value: number) => void;
  onDragRelease: (value: number) => void;
  onDragUpdate: (value: number) => void;
};

function Slider({
  value,
  disabled,
  isDragging,
  onDragStart,
  onDragRelease,
  onDragUpdate,
  children,
}: PropsWithChildren<Props>): ReactElement {
  function onPointerDown(ev: React.PointerEvent<HTMLDivElement>): void {
    if (disabled) {
      return;
    }

    ev.currentTarget.setPointerCapture(ev.pointerId);

    const value = calculateValue(ev.clientX, ev.currentTarget);

    onDragStart && onDragStart(value);
  }

  function onPointerMove(ev: React.PointerEvent<HTMLDivElement>): void {
    if (!isDragging) {
      return;
    }

    const value = calculateValue(ev.clientX, ev.currentTarget);

    onDragUpdate && onDragUpdate(value);
  }

  function onPointerUp(ev: React.PointerEvent<HTMLDivElement>): void {
    if (!isDragging) {
      return;
    }

    const value = calculateValue(ev.clientX, ev.currentTarget);

    onDragRelease && onDragRelease(value);
  }

  const valuePercent = clamp(value * 100, 0, 100);

  return (
    <div
      className={classNames(styles.root, {
        [styles.isDragging]: isDragging,
        [styles.disabled]: disabled,
      })}
    >
      <div
        className={styles.dragContainer}
        onPointerUp={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerCancel={onPointerUp}
      >
        <div className={styles.track}>
          {children}

          <span
            className={styles.trackValue}
            style={{ width: `${valuePercent}%` }}
          />

          <span className={styles.knob} style={{ left: `${valuePercent}%` }} />
        </div>
      </div>
    </div>
  );
}

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

export default Slider;
