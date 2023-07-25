import type { Component } from 'solid-js';
import { Routes, Route } from '@solidjs/router';
import Home from './pages/Home/Home';
import './styles.scss';
import NavigationBar from './components/NavigationBar/NavigationBar';

const App: Component = () => {
  const links = [
    { name: 'Home', path: 'Itervisus/' },
  ];

  return (
    <>
      <NavigationBar links={links} />

      <Routes>
        <Route path="/Itervisus/" component={Home} />
      </Routes>
    </>
  );
};

export default App;
