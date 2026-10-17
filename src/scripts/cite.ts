/** Wires every [data-copy] button to copy its citation and announce the result. */
export function initCiteButtons(root: ParentNode = document) {
  root.querySelectorAll<HTMLButtonElement>('button[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = button.parentElement?.querySelector('[aria-live]');
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
        if (status) status.textContent = 'Copied';
      } catch {
        if (status) status.textContent = 'Select the text above to copy it';
      }
    });
  });
}
