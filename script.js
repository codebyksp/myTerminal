// --- Shell Memory (simulate set and print) ---
const shellMemory = {};

function mem_set_value(varName, value) {
  shellMemory[varName] = value;
}

function mem_get_value(varName) {
  return shellMemory[varName] || null;
}

// --- Virtual File System (simulate ls, mkdir, touch, cd) ---
let fileSystem = {
  "/": {
    files: [],
    dirs: {}
  }
};

let currentPath = "/";

function getCurrentDir() {
  // Simple lookup given the currentPath (only supports root and one level)
  return fileSystem[currentPath];
}

function my_ls() {
  const dir = getCurrentDir();
  let listing = "";
  // List directories first
  for (let d in dir.dirs) {
    listing += d + "/\n";
  }
  // Then files
  dir.files.forEach(file => {
    listing += file + "\n";
  });
  return listing || "Directory is empty";
}

function my_mkdir(dirName) {
  if (!/^[A-Za-z0-9]+$/.test(dirName)) {
    return "Bad command: my_mkdir";
  }
  let dir = getCurrentDir();
  if (dir.dirs[dirName]) {
    return "Directory already exists";
  }
  dir.dirs[dirName] = { files: [], dirs: {} };
  return "";
}

function my_touch(fileName) {
  if (!/^[A-Za-z0-9]+$/.test(fileName)) {
    return "Bad command: my_touch";
  }
  let dir = getCurrentDir();
  if (dir.files.includes(fileName)) {
    return "File already exists";
  }
  dir.files.push(fileName);
  return "";
}

function my_cd(dirName) {
  // Only supporting cd into subdirectories or going back to root
  if (dirName === "..") {
    currentPath = "/";
    return "";
  }
  let dir = getCurrentDir();
  if (dir.dirs[dirName]) {
    // For this simple FS, assume all directories are directly under "/"
    currentPath = "/";
    return ""; // If you want to support deeper FS, update currentPath accordingly.
  }
  return "Bad command: my_cd";
}

// --- Command Processing ---
function processCommand(cmd) {
  const outputDiv = document.getElementById("output");
  let response = "";
  const args = cmd.split(" ").filter(s => s.length > 0);
  if (args.length === 0) {
    return;
  }
  const command = args[0];

  switch (command) {
    case "help":
      response = `Available commands:
help               Displays all the commands
quit               Exits the shell (refresh page to restart)
set VAR STRING     Sets a variable in shell memory
print VAR          Displays the variable's value
echo STRING        Echoes input (supports $VAR substitution)
my_ls              Lists files/directories in current folder
my_mkdir DIR       Creates a new directory (alphanumeric names only)
my_touch FILE      Creates a new file (alphanumeric names only)
my_cd DIR          Changes directory (only supports ".." to return to root)`;
      break;
    case "quit":
      response = "Bye!";
      disableTerminal();
      break;
    case "set":
      if (args.length < 3) {
        response = "Unknown command";
      } else {
        const varName = args[1];
        const value = args.slice(2).join(" ");
        mem_set_value(varName, value);
        response = "";
      }
      break;
    case "print":
      if (args.length !== 2) {
        response = "Unknown command";
      } else {
        const value = mem_get_value(args[1]);
        response = value !== null ? value : "Variable does not exist";
      }
      break;
    case "echo":
      if (args.length < 2) {
        response = "Unknown command";
      } else {
        // Replace any $VAR with its value
        response = args.slice(1).map(token => {
          if (token[0] === "$") {
            const varName = token.substring(1);
            const value = mem_get_value(varName);
            return value !== null ? value : "";
          }
          return token;
        }).join(" ");
      }
      break;
    case "my_ls":
      response = my_ls();
      break;
    case "my_mkdir":
      if (args.length !== 2) {
        response = "Unknown command";
      } else {
        response = my_mkdir(args[1]);
      }
      break;
    case "my_touch":
      if (args.length !== 2) {
        response = "Unknown command";
      } else {
        response = my_touch(args[1]);
      }
      break;
    case "my_cd":
      if (args.length !== 2) {
        response = "Unknown command";
      } else {
        response = my_cd(args[1]);
      }
      break;
    case "source":
      // For simplicity, we simulate sourcing by using a preloaded script
      // In a real website you could fetch a file using fetch() and run its contents line by line.
      response = "source command is not implemented in this demo.";
      break;
    case "run":
      // In C this would fork and run a process; here we just simulate.
      response = "run command is not supported in this browser-based shell.";
      break;
    default:
      response = "Unknown command: " + command;
  }

  // Append the command and the response to output.
  outputDiv.textContent += "$ " + cmd + "\n" + response + "\n";
  // Auto-scroll to the bottom
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

function disableTerminal() {
  const input = document.getElementById("command-input");
  input.disabled = true;
}

// --- Event Listener ---
document.getElementById("command-input").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    let cmd = this.value.trim();
    if (cmd !== "") {
      processCommand(cmd);
    }
    this.value = "";
  }
});
