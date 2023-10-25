import { Component } from "solid-js";
import { ButtonProperties } from "./ButtonTypes";
import './Button.scss';
import { A } from "@solidjs/router";

const Button: Component<ButtonProperties> = (props: ButtonProperties) => {
  return (
    <A
      class="button"
      href={props.path ?? ""}
      onClick={props.onClick}
    >
      {props.text}
    </A>
  );
}

export default Button;
