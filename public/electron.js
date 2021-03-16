const {app, BrowserWindow, Menu, dialog} = require('electron');
const path = require('path');

let currentFile = null;


function createWindow () {   
    // Create the browser window.     
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });
    
    //win.loadURL('http://localhost:3000/');
    win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);

    //win.webContents.openDevTools();

    return win;
} 

app.on('ready', ()=> {
    const mainWindow = createWindow();

    let menu = Menu.buildFromTemplate([
        {
            label: "File",
            submenu: [
                {
                    label: "Ouvrir",
                    "accelerator": "CmdOrCtrl+o",
                    click: ()=> {
                        dialog.showOpenDialog({
                            title: "Sélectionner le fichier de recette",
                            properties: ['openFile'],
                            filters: [
                                {
                                    "name": "beer",
                                    "extensions": ["beer"]
                                },
                                {
                                    "name": "json",
                                    "extensions": ["json"]
                                },
                                {
                                    "name": "all",
                                    "extensions": ["*"]
                                },
                            ],
                        }).then(function (response) {
                            if (!response.canceled) {
                              currentFile = response.filePaths[0];
                              mainWindow.webContents.send('open-file', response.filePaths[0]);
                            } else {
                              console.log("no file selected");
                            }
                        });
                    }
                },
                {
                    label: "Enregistrer",
                    "accelerator": "CmdOrCtrl+s",
                    click: () => {
                        if (currentFile != null) {
                            mainWindow.webContents.send('save-file', currentFile);
                        }
                    }
                },
                {
                    label: "Enregistrer sous...",
                    "accelerator": "CmdOrCtrl+Maj+s",
                    click: () => {
                        dialog.showSaveDialog({
                            title: "Sélectionner le fichier de recette",
                            properties: ['openFile'],
                            filters: [
                                {
                                    "name": "beer",
                                    "extensions": ["beer"]
                                }
                            ],
                        }).then(function (response) {
                            if (!response.canceled) {
                              currentFile = response.filePath;
                              mainWindow.webContents.send('save-file', response.filePath);
                            } else {
                              console.log("no file selected");
                            }
                        });
                    }
                },
                {
                    label: "Quitter",
                    "accelerator": "CmdOrCtrl+q",
                    click: () => app.quit()
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);
})

