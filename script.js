document.getElementById("command-input").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    let cmd = this.value.trim();
    processCommand(cmd);
    this.value = "";
  }
});

function processCommand(cmd) {
  const outputDiv = document.getElementById("output");
  
  // Simulate a simple command interpreter
  let response = "";
  const args = cmd.split(" ");
  const command = args[0];
  
  switch (command) {
    case "help":
      response = "Available commands: help, echo, clear, ...";
      break;
    case "echo":
      response = args.slice(1).join(" ");
      break;
    case "clear":
      outputDiv.textContent = "";
      return;
    // Add more cases to simulate commands like my_ls, my_mkdir, etc.
    default:
      response = "Unknown command: " + command;
  }
  
  outputDiv.textContent += "$ " + cmd + "\n" + response + "\n";
}

