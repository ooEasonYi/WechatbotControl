const electron = require('electron');
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path');
const url = require('url');
const fs = require('fs');
const request = require('request');
const Wechat = require('wechat4u');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 700 })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/app/login.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('ping', 'whoooooooh!');
        wechatInit();
    });
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


function wechatInit() {
    try {
        bot = new Wechat(require('./sync-data.json'));
    } catch (e) {
        bot = new Wechat();
    }
    
    if (bot.PROP.uin) {
        // 存在登录数据时，可以随时调用restart进行重启
        bot.restart();
    } else {
        bot.start();
    }
    /**
     * uuid事件，参数为uuid，根据uuid生成二维码
     */
    bot.on('uuid', uuid => {
        // qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
        //     small: true
        // })
        // console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
        sendNotice("二维码链接：https://login.weixin.qq.com/qrcode/"+ uuid);
        mainWindow.webContents.send('login', 'https://login.weixin.qq.com/qrcode/' + uuid);
    });


    /**
     * 登录用户头像事件，手机扫描后可以得到登录用户头像的Data URL
     */
    bot.on('user-avatar', avatar => {
        sendNotice('登录用户头像Data URL：'+ avatar);
    });
    /**
     * 登录成功事件
     */
    bot.on('login', () => {
        sendNotice('登录成功')
        // 保存数据，将数据序列化之后保存到任意位置
        fs.writeFileSync('./sync-data.json', JSON.stringify(bot.botData))
    });
    /**
     * 登出成功事件
     */
    bot.on('logout', () => {
        sendNotice('登出成功')
        // 清除数据
        fs.unlinkSync('./sync-data.json')
    });
    /**
     * 联系人更新事件，参数为被更新的联系人列表
     */
    bot.on('contacts-updated', contacts => {
        // console.log(contacts)
        sendNotice('联系人数量：'+ Object.keys(bot.contacts).length)
    });
    /**
     * 错误事件，参数一般为Error对象
     */
    bot.on('error', err => {
        sendNotice('错误：', err)
    });
}

function sendNotice(message){
    mainWindow.webContents.send('notice-event', message);
}