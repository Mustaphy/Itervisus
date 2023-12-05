import './Zoom.scss';
import { Component } from "solid-js";
import { ZoomProperties } from "./ZoomTypes";
import Plus from '../../assets/plus.svg';
import Minus from '../../assets/minus.svg';

const Zoom: Component<ZoomProperties> = (props: ZoomProperties) => {
  const onZoom = (delta: number): void => {
    props.setScale(previous => Math.min(Math.max(previous + delta, 0.1), 10));
  }

  return (
    <div id="zoom">
      <button onClick={() => onZoom(-0.1)}>
        <img src={Minus} alt="Zoom out" />
      </button>

      <button onClick={() => props.setScale(1)}>
        {new Intl.NumberFormat("en-US", { style: "percent"}).format(props.scale())}
      </button>

      <button onClick={() => onZoom(0.1)}>
        <img src={Plus} alt="Zoom in" />
      </button>
    </div>
  )
}

export default Zoom;
