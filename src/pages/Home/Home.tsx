import { Component } from 'solid-js';
import './Home.scss';
import Button from '../../components/Button/Button';
import Typewriter from '../../components/Typewriter/Typewriter';

const Home: Component = () => {
  const textsToType = [
    'brainstorm ideas',
    'draw diagrams',
  ];

  return (
    <>
      <div id="welcome-section">
        <p id="keywords">
          <span>Simple.</span>
          <span>Interactive.</span>
          <span>Customizable.</span>
        </p>

        <p id="description">
          Explore <span id="name">Itervisus</span>, your platform to create whiteboards.
          Use <span id="name">Itervisus</span> to <Typewriter textsToType={textsToType} />
        </p>

        <em id="work-in-progress">
          This project is still a work in progress. Therefore, many features are not yet available or not fully
          functional.
        </em>

        <Button text="Create a new whiteboard" path="workspace" />
      </div>
    </>
  );
};
  
export default Home;
