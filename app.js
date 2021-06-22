const express = require('express')

const app = express()

// 设置静态文件夹，会默认找当前目录下的index.html文件当做访问的页面
app.use(express.static(__dirname))

// WebSocket是依赖HTTP协议进行握手的
const serve = require('http').createServer(app)

const io = require('socket.io')(serve)

const SYSTEM = '系统'
// 存取socket实例
let socketObj = {}
// 设置一些颜色的数组，让每次进入聊天的用户颜色都不一样
let userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722'];

function shuffle(arr) {
   let len = arr.length, random;
   while (0 !== len) {
            // 右移位运算符向下取整
       random = (Math.random() * len--) >>> 0; 
            // 解构赋值实现变量互换
       [arr[len], arr[random]] = [arr[random], arr[len]]; 
   }
   return arr;
}
    

// 监听与客户端的连接事件
io.on('connection', socket => {
    // 记录用户名，用来记录是不是第一次进入，默认是undefined
    let username
    // 记录颜色
    let color
    // 监听客户端发送过来的信息
    socket.on('message', msg => {
        if(username) {
            // 正则判断消息是否是私聊专属
            let private = msg.match(/@([^ ]+) (.+)/); // match 返回的是一个数组
            // 是私聊信息
            if(private) {
                // 获取私聊用户
                const toUser = private[1]
                // 获取私聊内容
                const content = private[2]
                // 从socketObj中获取私聊用户的socket
                let toSocket = socketObj[toUser]; 
                
                if(toSocket) {
                    // 向私聊的用户发送信息
                    toSocket.send({
                        user: username,
                        content,
                        color,
                        createAt: new Date().toLocaleString()
                    })
                }
            }else {
                // 公聊信息
                io.emit('message', {
                    user: username,
                    content: msg,
                    color,
                    createAt: new Date().toLocaleString()
                })
            }
        }else { // 用户名不存在的情况
            // 如果是第一次进入的话，就将第一次输入的内容作为用户名
            username = msg
            // 向除了自己的所有人广播，毕竟进没进入自己是知道的，没必要跟自己再说一遍
            socket.broadcast.emit('message', {
                user: SYSTEM,
                content: `${username}加入了聊天！`,
                createAt: new Date().toLocaleString()
            })
            // 把socketObj对象上对应的用户名赋为一个socket
            // 如： socketObj = { '周杰伦': socket, '谢霆锋': socket }
            socketObj[username] = socket

            // 乱序后取出颜色数组中的第一个，分配给进入的用户
            color = shuffle(userColor)[0];


        }
    })
})

// 这里要用server去监听端口，而非app.listen去监听(不然找不到socket.io.js文件)
serve.listen(3000)