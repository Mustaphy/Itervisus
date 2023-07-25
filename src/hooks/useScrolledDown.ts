import { Accessor, createSignal, onCleanup } from 'solid-js';

export const useScrolledDown = (): Accessor<boolean> => {
  const [scrolledDown, setScrolledDown] = createSignal(false);

  onCleanup(() => {
    window.removeEventListener('scroll', onScroll);
  });

  const onScroll = () => {
    setScrolledDown(window.scrollY > 0);
  };

  window.addEventListener('scroll', onScroll);

  return scrolledDown;
};
