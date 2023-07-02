// disabling join button by default
document.getElementById("btn-join").disabled = true;

document.getElementById("username").addEventListener("input", function() {
    var username = document.getElementById("username").value.trim();
    document.getElementById("btn-join").disabled = (username === "");
});

// displaying username dynamically
document.getElementById("btn-join").addEventListener("click", function() {
    var username = document.getElementById("username").value.trim();
    document.getElementById("label-username").textContent = "Username: " + username;
});

// chat scrolling effect
var messagesContainer = document.getElementById("messages");
var messagesList = document.getElementById("messages-lists");

function scrollToBottom() {
    messagesContainer.scrollTop = messagesList.scrollHeight;
}

// Call this function after adding a new message
scrollToBottom();
