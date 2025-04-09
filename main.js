const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let win;
let tray;
let isQuiting = false;

function createWindow() {
    win = new BrowserWindow({
        width: 650,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'src/preload.js'),
        },
    });

    win.loadFile(path.join(__dirname, 'src/index.html'));

    // When the window is minimized, hide it.
    win.on('minimize', (event) => {
        event.preventDefault();
        win.hide();
    });
}

app.whenReady().then(() => {
    createWindow();

    // Create the tray icon (using PNG; on Windows you might use the ICO instead)
    const iconPath = path.join(__dirname, 'assets/icon.png');
    tray = new Tray(iconPath);

    // Add a left-click listener to show the app when the tray icon is clicked.
    tray.on('click', () => {
        win.show();
    });

    // Build the tray context menu.
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                win.show();
            }
        },
        {
            label: 'Quit',
            click: () => {
                isQuiting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('F1Electron');
    tray.setContextMenu(contextMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else {
            win.show();
        }
    });
});

app.on('before-quit', () => {
    isQuiting = true;
});

app.on('window-all-closed', () => {
    app.quit();
});
