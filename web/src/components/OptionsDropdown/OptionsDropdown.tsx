import classNames from 'classnames';
import { OptionsIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import If from 'components/If';
import React, {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import styles from './OptionsDropdown.module.scss';

type Props = {
  align?: 'left' | 'center' | 'right';
  className?: string;
};

type OptionProps = {
  onClick?: () => void;
  to?: string;
};

function OptionsDropdown({
  align = 'center',
  children,
  className,
}: PropsWithChildren<Props>): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function toggleExpanded() {
    setIsExpanded(!isExpanded);
  }

  useEffect(() => {
    function onDocumentClick(ev: MouseEvent) {
      if (!ref.current) {
        return;
      }

      if (!ev.target || !(ev.target instanceof Element)) {
        return setIsExpanded(false);
      }

      if (!ref.current.contains(ev.target)) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener('click', onDocumentClick);
    }

    return () => document.removeEventListener('click', onDocumentClick);
  }, [isExpanded]);

  return (
    <div
      className={classNames(styles.root, className, styles[align], {
        [styles.isExpanded]: isExpanded,
      })}
    >
      <button className={styles.toggleButton} onClick={toggleExpanded}>
        <Icon icon={<OptionsIcon />} />
      </button>
      <If condition={isExpanded}>
        <div
          ref={ref}
          className={styles.wrapper}
          onClick={() => setIsExpanded(false)}
        >
          <span className={styles.triangle} />
          <div className={styles.options}>{children}</div>
        </div>
      </If>
    </div>
  );
}

function Option({
  to,
  onClick,
  children,
}: PropsWithChildren<OptionProps>): ReactElement {
  if (to) {
    return (
      <Link to={to} className={styles.option} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <div className={styles.option} onClick={onClick}>
      {children}
    </div>
  );
}

OptionsDropdown.Option = Option;

export default OptionsDropdown;
