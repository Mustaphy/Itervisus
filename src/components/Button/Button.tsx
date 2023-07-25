import { Component } from "solid-js";
import { ButtonProperties } from "./ButtonTypes";
import './Button.scss';

const Button: Component<ButtonProperties> = (props: ButtonProperties) => {
  return (
    <button type="button" onClick={props.onClick}>
      {props.text}
    </button>
  );
}

export default Button;
