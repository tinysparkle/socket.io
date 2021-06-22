const socket = io()

socket.on('connect', () => {
    console.log('连接成功')
})

const list = document.getElementById('list');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

const send =  () => {
    let val = input.value;
    if(val) {
        socket.emit('message', val)
        input.value = ''
    }else {
        alert('输入的内容不能为空！')
    }
}
sendBtn.addEventListener('click', send);

input.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        send()
    }
})

// 监听message事件来接收服务端发来的消息
socket.on('message', data => {
    // 创建新的li元素，最终将其添加到list列表
    let li = document.createElement('li')
    li.className = 'list_group_item'
    li.innerHTML = `
        <p style="color: #ccc;">
            <span class="user" style="color: ${data.color}">${data.user}</span>
            ${data.createAt}
        </p>
        <p class="content" style="background:${data.color}">${data.content}</p>`
    // 将li添加到list列表中
    list.appendChild(li)
    // 将聊天区域的滚动条设置到最新内容的位置
    list.scrollTop = list.scrollHeight
})

// 私聊的方法
function privateChat(event) {
    let target = event.target
    let user = target.innerHTML
    if(target.className === 'user') {
        input.value = `@${user}`
    }
}

list.onclick = function(event) {
    privateChat(event)
} 