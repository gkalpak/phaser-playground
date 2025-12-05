export const alertDialog = (messageHtml, buttonText) => {
  return new Promise(resolve => {
    const dialog = Object.assign(window.document.createElement('dialog'), {
      innerHTML: `
        <form method="dialog" style="max-width: 500px; width: 50vw;">
          ${messageHtml}<br />
          <div style="text-align: center;">
            <button>${buttonText}</button>
          </div>
        </form>
      `,
      onclose: () => resolve(),
      style: `
        position: fixed;
        top: 25vh;
      `,
    });
    window.document.body.appendChild(dialog);
    dialog.showModal();
  });
}

export const openWindow = url => {
  const win = window.open(url, '_blank');

  if (!win) {
    window.location.assign(url);
  } else if (win.focus) {
    win.focus();
  }
};
