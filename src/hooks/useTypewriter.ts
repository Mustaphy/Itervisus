import { createSignal, createEffect, onCleanup } from 'solid-js';

const typewriterStatuses = ['typing', 'pausing', 'deleting'] as const;
type TypewriterStatus = typeof typewriterStatuses[number];

export const useTypewriter = (textsToType: string[]) => {
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [status, setStatus] = createSignal<TypewriterStatus>('typing');
  const [currentTypingText, setCurrentTypingText] = createSignal('');

  const TYPING_SPEED = 100;
  const TYPING_PAUSE = 2000;
  const DELETING_SPEED = 70;
  const DELETING_PAUSE = 700;

  createEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    switch (status()) {
      case 'typing': {
        const nextTextToType = textsToType[selectedIndex()].slice(0, currentTypingText().length + 1);

        if (nextTextToType === currentTypingText()) {
          setStatus('pausing');
          break;
        }

        timeout = setTimeout(() => {
          setCurrentTypingText(nextTextToType);
        }, TYPING_SPEED);

        break;
      }

      case 'pausing': {
        timeout = setTimeout(() => {
          setStatus('deleting');
        }, TYPING_PAUSE);

        break;
      }

      case 'deleting': {
        const remainingText = currentTypingText().slice(0, -1);

        if (!currentTypingText()) {
          timeout = setTimeout(() => {
            const nextIndex = selectedIndex() + 1;
            setSelectedIndex(textsToType[nextIndex] ? nextIndex : 0);
            setStatus('typing');
          }, DELETING_PAUSE);
        }

        timeout = setTimeout(() => {
          setCurrentTypingText(remainingText);
        }, DELETING_SPEED);

        break;
      }
    }

    onCleanup(() => clearTimeout(timeout));
  });

  return {
    currentTypingText: currentTypingText,
    currentText: textsToType[selectedIndex()],
  };
};
