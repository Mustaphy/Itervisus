import { Component } from "solid-js";
import { ButtonProperties } from "./ButtonTypes";
import './Button.scss';
import { A } from "@solidjs/router";

const Button: Component<ButtonProperties> = (props: ButtonProperties) => {
  return (
    <A href={props.path ?? ""} onClick={props.onClick} class="button">
      {props.text}
    </A>
  );
}

export default Button;
