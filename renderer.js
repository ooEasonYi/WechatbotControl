// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipc = require('electron').ipcRenderer;
const noticeList = document.getElementById("log");
const qrCode = document.getElementById("qrcode");
ipc.on('notice-event', function (event, input) {
	let li = document.createElement("li");
	li.textContent = input;
	console.log(input);
	noticeList.appendChild(li);
});

ipc.on("login", (event, input) => {
	qrCode.src = input;
});