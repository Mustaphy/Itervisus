import type { Component } from 'solid-js';
import { Routes, Route } from '@solidjs/router';
import Home from './pages/Home/Home';
import './styles.scss';
import NavigationBar from './components/NavigationBar/NavigationBar';
import Workspace from './pages/Workspace/Workspace';
import { NavigationLink } from './components/NavigationBar/NavigationBarTypes';

const App: Component = () => {
  const links: NavigationLink[] = [
    { name: 'Home', path: 'Itervisus/' },
    { name: 'Workspace', path: 'Itervisus/workspace' },
  ];

  return (
    <>
      <NavigationBar links={links} />

      <Routes>
        <Route path="/Itervisus/" component={Home} />
        <Route path="/Itervisus/workspace" component={Workspace} />
      </Routes>
    </>
  );
};

export default App;
