'use strict'
const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, dialog, BrowserWindow, Menu, ipcMain }  = electron;

let mainWindow;
let inputWindow;

// SET ENV
process.env.NODE_ENV = 'production';

// Listen for app to be ready
app.on('ready', () => {
    // Create new window
    mainWindow = new BrowserWindow({
        resizable: false,
        width: 1024,
        height: 720
    });
    mainWindow.setBack
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol:'file',
        slashes: true
    }));
    mainWindow.setTitle("Demografie - piramida populatiei");

    // Quit app when closed
    mainWindow.on('closed', () => app.quit());

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createItemWindow(){
    // Create new window
    inputWindow = new BrowserWindow({
        resizable: false,
        frame: false,
        backgroundColor: '#ffffe8',
        width: 355,
        height: 240,
        title: 'Adauga date'
    });
    inputWindow.setMenuBarVisibility(false);
    // Load html into window
    inputWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'inputWindow.html'),
        protocol:'file',
        slashes: true
    }));

    // Garbage collection handle
    inputWindow.on('close', () => { inputWindow = null });
};
  
let saveAsPng = function() {
    mainWindow.webContents.send('image');
}
let chooseAccelerator = function(key){
    return process.platform == 'darwin' ? 'Command+' + key : 'Ctrl+' + key;
};

// Catch data
ipcMain.on('data', (e, data) => {
    mainWindow.webContents.send('data', data);
    inputWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Adauga date',
                accelerator: chooseAccelerator("W"),
                click(){
                    if (inputWindow == null){
                        createItemWindow();
                    }else {
                        inputWindow.show();
                    }
                }
            },
            {
                label: 'Exporta ca PNG',
                accelerator: chooseAccelerator("S"),
                click(){
                    saveAsPng();
                }
            },
            {
                label: 'Inchide',
                accelerator: chooseAccelerator("Q"),
                click(){
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Despre',
        submenu: [
            {
                label: 'Ajutor',
                click(){
                    dialog.showMessageBox(mainWindow, {
                        type: "none",
                        title: "Ajutor",
                        message: "Aplicatia accepta fisiere .csv conform modelului disponibil pe site-ul INSSE.",
                        buttons: ["OK"],
                    } );
                }
            },
            {
                label: 'Despre',
                click(){
                    dialog.showMessageBox(mainWindow, {
                        type: "none",
                        title: "Scop",
                        message: "Aplcatia a fost creata ca tema pentru materia Demografie (CSIE - ASE) 2019\n" + 
                                "\nStudent: Pavel Mircea\nGrupa: 1121\n" + 
                                "Proiect: https://github.com/mirceap/population-pyramid",
                        buttons: ["OK"],
                    } );
                }
            }
        
        ]
    }
];

// If mac, add empty object to the menu 
// for correct rendering
if (process.platform == "darwin"){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: chooseAccelerator("I"),
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}