const { ipcMain, utilityProcess } = require('electron');
const path = require('path');
const { findFreePorts } = require('find-free-ports');

let refCount = 0;
let codeServerProc;
let initPromise;

const extensionsDir = path.resolve(__dirname, '..', 'vscode', 'extensions');

const registerVscIpc = (mainWindow) => {
  ipcMain.handle('renderer:open-code-server', async () => {
    try {
      refCount += 1;
      if (refCount === 1) {
        console.log('[vsc] init code-server');
        const codeServer = require.resolve('code-server');
        const [port] = await findFreePorts(1);
        const addr = `127.0.0.1:${port}`;
        codeServerProc = utilityProcess.fork(
          codeServer,
          [
            '--auth=none',
            '--disable-telemetry',
            '--disable-update-check',
            '--disable-workspace-trust',
            '--disable-getting-started-override',
            '--ignore-last-opened',
            `--extensions-dir=${extensionsDir}`,
            `--bind-addr=${addr}`
          ],
          {
            stdio: ['ignore', 'pipe', 'ignore']
          }
        );
        initPromise = new Promise((resolve, reject) => {
          codeServerProc.stdout.on('data', (e) => {
            const data = e.toString();
            process.stdout.write(data);
            const match = data.match(/HTTP server listening on (.*)/);
            if (match) {
              const href = match[1];
              console.log('[vsc] got href: ', href);
              resolve(href);
            }
          });

          codeServerProc.on('exit', () => {
            reject();
          });
        });

        process.on('exit', () => {
          codeServerProc?.kill();
        });
      }
      return initPromise;
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('renderer:close-code-server', async () => {
    try {
      return;
      // skip close for speed
      refCount -= 1;
      if (refCount === 0) {
        console.log('[vsc] shutdown code-server');
        codeServerProc?.kill();
        codeServerProc = null;
        initPromise = null;
      }
    } catch (error) {
      throw error;
    }
  });
};

module.exports = registerVscIpc;
