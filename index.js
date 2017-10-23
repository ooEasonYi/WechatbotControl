const fs = require('fs')
const url = require('url')
const path = require('path')

let charset = "utf8"
let filePath = "C:/Users/tengfa/Desktop/htmlcoder.me.har"
let saveDir = "./web/"

fs.readFile(filePath, charset, (err, data) => {
    if (err) {
        console.log(err)
    }
    let harJson = JSON.parse(data)
    parseMain(harJson)
});

function parseMain(harJson) {
    console.log("download resources count:" + harJson.log.entries.length);

    let entries = harJson.log.entries
    
    entries.forEach((item) => {
        let itemUri = url.parse(item.request.url);

        let itemPath = saveDir + itemUri.host;
        let itemFilePath = itemPath + itemUri.pathname;
        console.log(itemFilePath, path.parse(itemFilePath))
        //创建根目录文件夹
        if (!fs.existsSync(itemPath)) fs.mkdirSync(itemPath);


        createDir(path.parse(itemFilePath).dir, itemPath)
        let type = item.response.headers.filter((head) => head.name.toLowerCase() == "content-type")
        console.log(item.response.headers)



        //保存文件
        if (type[0] && type[0].value.indexOf("image") > -1) {
            let dataBuffer = new Buffer(item.response.content.text, 'base64');
            fs.writeFileSync(itemFilePath, dataBuffer)
        } else {
            fs.writeFileSync(itemFilePath, item.response.content.text)
        }
    });

}


function createDir(strPath) {
    let arrDir = strPath.split("/")
    for (let i = 0; i < arrDir.length; i++) {
        let dirPath =  arrDir.slice(0, i + 1).join("/");
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
    }
}

