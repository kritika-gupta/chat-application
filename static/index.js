const message_template = Handlebars.compile(document.querySelector("#message-template").innerHTML);
const channel_link_template = Handlebars.compile(document.querySelector("#channel-link-template").innerHTML);

document.addEventListener("DOMContentLoaded", () => {

    console.log("DOMContentLoaded");

    // current user
    let user = localStorage.getItem("user");
    if (!user) {
        $('#join-modal').modal("show");
    }
    else {
        document.querySelector("#username").innerHTML = user;
    }
    user = localStorage.getItem("user");

    let channel = localStorage.getItem("channel");
    if (!channel) display_channel("Home");
    else {
        display_channel(channel);
    }
    

    // connect to socket io
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // join as user
    document.querySelector("#username-form").addEventListener("submit", function (event) {
        event.preventDefault();
        user_entered = document.querySelector("#enter-user").value;
        if (user_entered) {

            localStorage.setItem("user", user_entered);
            document.querySelector("#username").innerHTML = user_entered;
            $('#join-modal').modal("hide");
        }
        return false;
    });

    // change current user
    document.querySelector("#change-user").addEventListener("click", function () {
        $('#join-modal').modal("show");
    });

    window.addEventListener("storage", function (e) {
        if (e.key === "user") {
            document.querySelector("#username").innerHTML = e.newValue;
        }
    });

    // send a new message
    document.querySelector("#send-message").addEventListener("submit", function (event) {
        console.log("sending");
        event.preventDefault();
        message = document.querySelector("#new-message").value;
        if (message) {
            let data = { "content": message, "sender": localStorage.getItem("user"), "channel": localStorage.getItem("channel") };
            socket.emit("send message", data);
        }
        document.querySelector("#new-message").value = "";
    });

    // receive new message
    socket.on("get message", function (data) {
        if (document.querySelector("#channel-name").innerHTML === data.channel) {
            let message = message_template({'sender':data.sender, 'content':data.content})
            document.querySelector("#message-list").innerHTML += message;
            
        }
    });
    
    // add a new channel
    document.querySelector("#add-channel").addEventListener("click", () => {
        $('#new-channel-modal').modal("show");
    });


    // submit new channel modal form
    document.querySelector("#channel-form").addEventListener("submit", function (event) {
        event.preventDefault();
        channel_name = document.querySelector("#enter-channel").value;
        if (channel_name) {
            socket.emit("new channel", { "name": channel_name });
            $('#new-channel-modal').modal("hide");
        }
    })

    // duplicate channel
    socket.on("duplicate channel", function (channel_name) {
        alert(`${channel_name} already exists!`);
    });

    // receive and insert a new channel
    socket.on("channel added", function (channel) {
        channel = JSON.parse(channel);
        
        let channel_item = channel_link_template({ 'channel_name': channel.name })
        let channel_element = document.createElement("li");
        channel_element.innerHTML = channel_item;

        channel_element.addEventListener("click", function (event) {
            event.preventDefault();
            display_channel(channel.name);
        })
        document.querySelector("#channel-list").appendChild(channel_element);
    });
});

function display_channel(channel_name) {
    const request = new XMLHttpRequest();
    request.open("GET", `/channel/${channel_name}`);
    request.onload = (e) => {
        const response = request.responseText;
        data = JSON.parse(response);
        document.querySelector("#channel-name").innerHTML = data.name;
        document.querySelector("#message-list").innerHTML = "";
        data.messages.forEach((message) => {
            let content = message_template({ 'sender': message.sender, 'content': message.content });
            document.querySelector("#message-list").innerHTML += content;
        });
    };
    request.send();
    localStorage.setItem("channel", channel_name);
}