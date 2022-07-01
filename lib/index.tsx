import type { PropsWithRef, PropsWithChildren } from 'react';
import React, { Suspense } from 'react';

export type LazyComponentProps = JSX.IntrinsicAttributes;

export type LazyComponentFactory<T> = () => Promise<{
  default: React.FunctionComponent<T> | React.ComponentType<T>;
}>;

export type LazyComponentType<T> = React.FunctionComponent<
  PropsWithRef<PropsWithChildren<T>>
>;

const LazyComponent = <T extends LazyComponentProps>(
  name: string,
  factory: LazyComponentFactory<T>,
  fallback?: JSX.Element,
): LazyComponentType<T> => {
  const TheLazyComponent = React.lazy(factory);
  const Component = (
    props: PropsWithRef<PropsWithChildren<T>>,
  ): JSX.Element => (
    <Suspense fallback={fallback}>
      <TheLazyComponent {...props} />
    </Suspense>
  );
  Component.displayName = `LazyComponent(${name})`;
  return Component;
};

interface LazyComponentSpecDetail {
  component: LazyComponentFactory<LazyComponentProps>;
  fallback?: JSX.Element;
}

export type LazyComponentsSpec =
  | LazyComponentFactory<LazyComponentProps>
  | LazyComponentSpecDetail;

export type LazyComponentsResult<S> = {
  [K in keyof S]: LazyComponentType<LazyComponentProps>;
};

export const createLazyComponents = <
  S extends Record<string, LazyComponentsSpec>,
>(
  specs: S,
  fallback?: JSX.Element,
): LazyComponentsResult<S> =>
  Object.entries(specs).reduce(
    (result, [name, factory]): LazyComponentsResult<S> => {
      const { component, fallback: fallbackOverride } = (
        typeof factory === 'function'
          ? { component: factory, fallback }
          : factory
      ) as LazyComponentSpecDetail;
      // eslint-disable-next-line no-param-reassign
      result[name as keyof S] = LazyComponent(
        name,
        component,
        fallbackOverride || fallback,
      );
      return result;
    },
    {} as LazyComponentsResult<S>,
  );

export default LazyComponent;
