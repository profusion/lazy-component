import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { createLazyComponents } from '@profusion/lazy-component';

import routesNames from './routes/pages';

import './App.css';

const Loader = (): JSX.Element => <div className="loading">Loading ...</div>;

const delayInMilliseconds = (timeout: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, timeout);
  });

// As these pages are pretty simple to load,
// this 'delay' function introduces a fake delay
// in them so that it is possible to see the Loader

const lazyRoutes = createLazyComponents(
  {
    [routesNames.Page1]: () =>
      delayInMilliseconds(2000).then(() => import('./routes/pages/Page1')),
    [routesNames.Page2]: () =>
      delayInMilliseconds(2000).then(() => import('./routes/pages/Page2')),
  },
  <Loader />,
);

const Home = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <div className="container">
    <ul>
      <li>
        <Link to="/page1">Page1</Link>
      </li>
      <li>
        <Link to="/page2">Page2</Link>
      </li>
    </ul>
    {children}
  </div>
);

const LazyRoutes = Object.entries(lazyRoutes).map(([name, Component]) => {
  return <Route path={name} element={<Component />} key={name} />;
});

const App = (): JSX.Element => (
  <BrowserRouter>
    <Home>
      <Routes>{LazyRoutes}</Routes>
    </Home>
  </BrowserRouter>
);

export default App;
