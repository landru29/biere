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
    
    win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);

    //win.webContents.openDevTools();

    return win;
} 

app.on('ready', ()=> {
    const mainWindow = createWindow();

    let menu = Menu.buildFromTemplate([
        {
            label: "Fichier",
            submenu: [
                {
                    label: "Nouveau",
                    "accelerator": "CmdOrCtrl+n",
                    click: () => {
                        if (currentFile != null) {
                            mainWindow.webContents.send('file-new', currentFile);
                        }
                    }
                },
                { type: 'separator' },
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
                              mainWindow.webContents.send('file-open', response.filePaths[0]);
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
                            mainWindow.webContents.send('file-save', currentFile);
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
                              mainWindow.webContents.send('file-save', response.filePath);
                            } else {
                              console.log("no file selected");
                            }
                        });
                    }
                },
                { type: 'separator' },
                {
                    label: "Imprimer",
                    "accelerator": "CmdOrCtrl+p",
                    click: () => {
                        mainWindow.webContents.print();
                    }
                },
                { type: 'separator' },
                {
                    label: "Quitter",
                    "accelerator": "CmdOrCtrl+q",
                    click: () => app.quit()
                }
            ]
        },
        {
            label: "Edition",
            submenu: [
                {
                    label: "Annuler",
                    "accelerator": "CmdOrCtrl+z",
                    click: () => {
                         mainWindow.webContents.send('edit-cancel', currentFile);
                    }
                },
                {
                    label: "Refaire",
                    "accelerator": "CmdOrCtrl+y",
                    click: () => {
                        mainWindow.webContents.send('edit-redo', currentFile);
                    }
                },
            ]
        },
    ]);
    Menu.setApplicationMenu(menu);
})

