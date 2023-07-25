import './NavigationBar.scss';
import { A } from '@solidjs/router';
import { useScrolledDown } from '../../hooks/useScrolledDown';
import { NavigationBarProperties } from './NavigationBarTypes';
import { Component, For } from 'solid-js';

const NavigationBar: Component<NavigationBarProperties> = (props: NavigationBarProperties) => {
  const scrolledDown = useScrolledDown();

  return (
    <>
      <div class="navigation-bar" classList={{sticky: scrolledDown()}}>
        <A id="navigation-name" href={"/Itervisus/"}>Itervisus</A>

        <nav>
          <ul id="navigation-links">
            <For each={props.links}>{(link) =>
              <li>
                <A class="navigation-text" href={link.path}>{link.name}</A>
              </li>
            }</For>
          </ul>
        </nav>
      </div>

      <div class="navigation-bar filler"></div>
    </>
  );
}

export default NavigationBar;
