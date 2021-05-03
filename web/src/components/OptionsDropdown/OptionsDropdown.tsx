import classNames from 'classnames';
import { OptionsIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
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
  align?: 'left' | 'right';
  className?: string;
};

type OptionProps = {
  onClick?: () => void;
  to?: string;
};

function OptionsDropdown({
  align = 'right',
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
      <IconButton icon={<OptionsIcon />} onClick={toggleExpanded} />
      <If condition={isExpanded}>
        <div
          ref={ref}
          className={styles.wrapper}
          onClick={() => setIsExpanded(false)}
        >
          {children}
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
