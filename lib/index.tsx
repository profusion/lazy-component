import type { PropsWithRef, PropsWithChildren, ReactNode } from 'react';
import React, { Suspense } from 'react';

interface WrapperProps {
  children: ReactNode;
  name: string;
}

export type WrapperType = ({ children, name }: WrapperProps) => JSX.Element;

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
  fallback: JSX.Element,
  Wrapper?: WrapperType,
): LazyComponentType<T> => {
  const TheLazyComponent = React.lazy(factory);
  const Component = (
    props: PropsWithRef<PropsWithChildren<T>>,
  ): JSX.Element => {
    const SuspenseWithLazyComponent = (): JSX.Element => (
      <Suspense fallback={fallback}>
        <TheLazyComponent {...props} />
      </Suspense>
    );
    if (Wrapper)
      return (
        <Wrapper name={name}>
          <SuspenseWithLazyComponent />
        </Wrapper>
      );

    return <SuspenseWithLazyComponent />;
  };
  Component.displayName = `LazyComponent(${name})`;
  return Component;
};

interface LazyComponentSpecDetail {
  component: LazyComponentFactory<LazyComponentProps>;
}

export type LazyComponentsSpec =
  | LazyComponentFactory<LazyComponentProps>
  | LazyComponentSpecDetail;

export type LazyComponentsResult<S> = {
  [K in keyof S]: LazyComponentType<LazyComponentProps>;
};

export interface LazyComponentOptions {
  fallback: JSX.Element;
  Wrapper?: WrapperType;
}

export const createLazyComponents = <
  S extends Record<string, LazyComponentsSpec>
>(
  specs: S,
  { fallback, Wrapper }: LazyComponentOptions,
): LazyComponentsResult<S> =>
  Object.entries(specs).reduce(
    (result, [name, factory]): LazyComponentsResult<S> => {
      const { component } = (typeof factory === 'function'
        ? { component: factory, fallback }
        : factory) as LazyComponentSpecDetail;
      // eslint-disable-next-line no-param-reassign
      result = {
        ...result,
        [name]: LazyComponent(name, component, fallback, Wrapper),
      };
      return result;
    },
    {} as LazyComponentsResult<S>,
  );

export default LazyComponent;
