async function loadEntryModule(path, ext = 'js') {
  const directoryPath = path.substring(0, path.lastIndexOf('/') + 1);
  const modulePath = `${directoryPath}entry.${ext}`;
  try {

    switch (ext) {
      case 'js':
        const module = await import(modulePath);
        // return module;
        break;
        
      case 'css':
        const style = document.createElement('style');
        style.textContent = await (await fetch(modulePath)).text();
        document.head.appendChild(style);
        break;
      
      case 'html':

        // Make head request to verify is not 404
        const head = await fetch(modulePath, {
          method: 'HEAD',
          mode: 'cors',
          cache: 'no-cache'
        });

        // If head request is 404, then return 404
        if (head.status === 404) {
          return 404;
        }
        
        const html_ = await (await fetch(modulePath)).text();
        const domParser = new DOMParser();
        const newDoc = domParser.parseFromString(html_, "text/html");
        
        const mainElts = newDoc.querySelectorAll('main');
        for (const main of mainElts) {
          main.dispatchEvent(new Event("html:beforeExec", { bubbles: true }));
          html.exec(main);
          main.dispatchEvent(new Event("html:afterExec", { bubbles: true }));
        }
        break;

      case 'chubcode':
        // const chubcode = await (await fetch(modulePath)).text();
        beamChub(modulePath, "html");
        break;
        
      default:
        throw new Error(`Unknown file extension: ${ext}`);
        break;
    }

    console.log(`Module loaded from ${modulePath}`);
  } catch (error) {
    console.error(`Error loading module from ${modulePath}:`, error);
  }
}

void async function main() {

  await loadEntryModule(`app` + location.pathname);
  await loadEntryModule(`app` + location.pathname, 'html');
  await loadEntryModule(`app` + location.pathname, 'chubcode');

}()