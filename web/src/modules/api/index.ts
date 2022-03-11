import { ApiError } from 'leafplayer-common';
import { AuthContext } from 'modules/auth';
import { useCallback, useContext, useEffect, useState } from 'react';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

type UseApiState<T> = {
  data?: T;
  isLoading: boolean;
  error?: ApiError;
};

type UseApiActions<T> = {
  reload: () => void;
  setData: (data: T) => void;
};

export function buildApiUrl(slug: string): string {
  return `/api/${slug}`;
}

export function isApiError(object: unknown): object is ApiError {
  const maybeApiError = object as ApiError;

  return (
    typeof maybeApiError.statusCode === 'number' &&
    typeof maybeApiError.error === 'string' &&
    typeof maybeApiError.message === 'string'
  );
}

async function makeApiRequest<TResponse, TBody = unknown>(
  method: HttpMethod,
  slug: string,
  body?: TBody,
): Promise<TResponse | ApiError> {
  const response = await fetch(buildApiUrl(slug), {
    body: body ? JSON.stringify(body) : undefined,
    headers: body
      ? {
          Accept: 'application/json',
          'Content-type': 'application/json',
        }
      : {
          Accept: 'application/json',
        },
    method,
  });

  if (!response.ok) {
    try {
      const jsonBody = await response.json();

      return isApiError(jsonBody)
        ? jsonBody
        : {
            error: 'Unknown Error',
            statusCode: response.status,
            message: await response.text(),
          };
    } catch (e) {
      return {
        error: response.statusText,
        statusCode: response.status,
        message: `Unexpected status: ${response.statusText}`,
      };
    }
  }

  const bodyContent = await response.text();

  try {
    return JSON.parse(bodyContent) as TResponse;
  } catch (e) {
    return bodyContent as unknown as TResponse;
  }
}

export function makeApiGetRequest<TResponse>(
  slug: string,
): Promise<TResponse | ApiError> {
  return makeApiRequest<TResponse, null>(HttpMethod.GET, slug, null);
}

export function makeApiPostRequest<TResponse, TBody = unknown>(
  slug: string,
  body?: TBody,
): Promise<TResponse | ApiError> {
  return makeApiRequest<TResponse, TBody>(HttpMethod.POST, slug, body);
}

export function makeApiDeleteRequest<TBody = unknown>(
  slug: string,
  body?: TBody,
): Promise<ApiError | void> {
  return makeApiRequest<void, TBody>(HttpMethod.DELETE, slug, body);
}

export function useApiData<TResponse = unknown>(
  slug: string,
): [UseApiState<TResponse>, UseApiActions<TResponse>] {
  const [data, setData] = useState<TResponse | undefined>(undefined);
  const [error, setError] = useState<ApiError | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { storeUser } = useContext(AuthContext);

  const execute = useCallback(async () => {
    setError(undefined);
    setIsLoading(true);

    const result = await makeApiGetRequest<TResponse>(slug);

    setIsLoading(false);

    if (isApiError(result)) {
      if (result.statusCode === 401) {
        storeUser(null);
      } else {
        setError(result);
      }
    } else {
      setData(result);
    }
  }, [slug, storeUser]);

  useEffect(() => {
    execute().catch(console.error);
  }, [execute]);

  return [
    {
      data,
      isLoading,
      error,
    },
    {
      reload: execute,
      setData,
    },
  ];
}
