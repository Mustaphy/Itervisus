import { Component } from 'solid-js';
import './Home.scss';
import Button from '../../components/Button/Button';
import Typewriter from '../../components/Typewriter/Typewriter';

const Home: Component = () => {
  const textsToType = [
    'Class Diagrams',
    'Sequence Diagrams',
    'Use Case Diagrams'
  ];

  return (
    <>
      <div id="welcome-section">
        <p id="keywords">
          <span>Simple. </span>
          <span>Interactive.</span>
          <span>Customizable.</span>
        </p>

        <p id="description">
          Utilize an user-friendly interface to create diagrams, such as <Typewriter textsToType={textsToType} />
        </p>

        <em id="work-in-progress">
          This project is still a work in progress. Therefore, many features are not yet available or not fully functional.
        </em>

        <Button text="Create a diagram" onClick={() => {}} />
      </div>
    </>
  );
};
  
export default Home;
