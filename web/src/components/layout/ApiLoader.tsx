import { useApiData } from 'modules/api';
import React, { ReactElement } from 'react';
import FullPageErrorIndicator from './FullPageErrorIndicator/FullPageErrorIndicator';
import FullPageLoadingIndicator from './FullPageLoadingIndicator/FullPageLoadingIndicator';

type Props<TData> = {
  slug: string;
  renderContent: (data: TData, reload: () => void) => ReactElement;
  useCachedData?: boolean;
};

function ApiLoader<TData>({
  slug,
  renderContent,
  useCachedData,
}: Props<TData>): ReactElement {
  const [{ data, error, isLoading }, reload] = useApiData<TData>(slug);

  const cacheAvailable = !!data;
  const useCache = useCachedData && cacheAvailable;

  if (isLoading && !useCache) {
    return <FullPageLoadingIndicator />;
  }

  if (error || !data) {
    return <FullPageErrorIndicator message={error?.error || 'Unknown error'} />;
  }

  return renderContent(data, reload);
}

export default ApiLoader;
