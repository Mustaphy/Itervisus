import './Typewriter.scss';
import { TypewriterProperties } from './TypewriterTypes';
import { useTypewriter } from '../../hooks/useTypewriter';
import { Component } from 'solid-js';

const Typewriter: Component<TypewriterProperties> = (props: TypewriterProperties) => {
  const { currentTypingText, currentText } = useTypewriter(props.textsToType);

  return (
    <span class="typewriter-cursor" aria-label={currentText}>
      {currentTypingText()}
    </span>
  )
}

export default Typewriter;
