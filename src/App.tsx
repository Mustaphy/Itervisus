import type { Component } from 'solid-js';
import { Routes, Route } from '@solidjs/router';
import Home from './pages/Home/Home';
import './styles.scss';

const App: Component = () => {
  return (
    <>
      <Routes>
        <Route path="/Itervisus/" component={Home} />
      </Routes>
    </>
  );
};

export default App;
