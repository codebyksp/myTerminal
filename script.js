// ------------------ File System Setup ------------------
// Permanent file system (your fixed files and directories)
const permanentFS = {
  "/": {
    files: {},
    dirs: {
      "aboutMe": {
        files: {
          "resume.txt": "This is my resume. Update it with your actual resume.",
          "contactMe.txt": "This is my contact info. Update it with your actual contact info."
        },
        dirs: {}
      }
    }
  }
};

// Local file system (user changes only)
const localFS = {
  "/": {
    files: {},
    dirs: {}
  }
};

// The current path starts at root
let currentPath = "/";

// ------------------ Helper Functions ------------------
function getDirectory(fs, path) {
  // path is a string like "/" or "/aboutMe"
  let parts = path.split("/").filter(part => part !== "");
  let dir = fs["/"];
  for (let p of parts) {
    if (dir.dirs[p]) {
      dir = dir.dirs[p];
    } else {
      return null;
    }
  }
  return dir;
}

// Combine permanent and local directories (local changes override permanent if needed)
function getCombinedDirectory(path) {
  const permDir = getDirectory(permanentFS, path) || { files: {}, dirs: {} };
  const localDir = getDirectory(localFS, path) || { files: {}, dirs: {} };

  // Merge directories: union of keys
  const combinedDirs = { ...permDir.dirs, ...localDir.dirs };
  // Merge files: local files override permanent ones if same name exists
  const combinedFiles = { ...permDir.files, ...localDir.files };

  return { dirs: combinedDirs, files: combinedFiles };
}

// ------------------ Command Implementations ------------------
function my_ls() {
  const combined = getCombinedDirectory(currentPath);
  let listing = "";
  Object.keys(combined.dirs).forEach(name => {
    listing += name + "/\n";
  });
  Object.keys(combined.files).forEach(name => {
    listing += name + "\n";
  });
  return listing || "Directory is empty";
}

function my_mkdir(dirName) {
  if (!/^[A-Za-z0-9]+$/.test(dirName)) {
    return "Bad command: my_mkdir";
  }
  // Check if directory already exists in either FS.
  const permDir = getDirectory(permanentFS, currentPath);
  const localDir = getDirectory(localFS, currentPath);
  if ((permDir && permDir.dirs[dirName]) || (localDir && localDir.dirs[dirName])) {
    return "Directory already exists";
  }
  // Create in localFS only
  if (!localDir) {
    return "Current directory not found in localFS";
  }
  localDir.dirs[dirName] = { files: {}, dirs: {} };
  return "";
}

function my_touch(fileName) {
  // Allow alphanumeric characters and a dot (for file extension)
  if (!/^[A-Za-z0-9.]+$/.test(fileName)) {
    return "Bad command: my_touch";
  }
  const permDir = getDirectory(permanentFS, currentPath);
  const localDir = getDirectory(localFS, currentPath);
  // Prevent modifying permanent files
  if (permDir && permDir.files[fileName] !== undefined) {
    return "File already exists (permanent)";
  }
  if (localDir.files[fileName] !== undefined) {
    return "File already exists";
  }
  // Create file in localFS with empty content
  localDir.files[fileName] = "";
  return "";
}

function my_cd(dirName) {
  if (dirName === "..") {
    if (currentPath === "/") {
      return "Already at root";
    } else {
      let parts = currentPath.split("/").filter(x => x !== "");
      parts.pop();
      currentPath = "/" + parts.join("/");
      if (currentPath === "/") currentPath = "/";
      return "";
    }
  } else {
    // Check in both permanent and local FS
    const permDir = getDirectory(permanentFS, currentPath);
    const localDir = getDirectory(localFS, currentPath);
    const existsInPerm = permDir && permDir.dirs && permDir.dirs[dirName];
    const existsInLocal = localDir && localDir.dirs && localDir.dirs[dirName];
    if (existsInPerm || existsInLocal) {
      currentPath = currentPath === "/" ? "/" + dirName : currentPath + "/" + dirName;
      return "";
    }
    return "Bad command: my_cd";
  }
}

function cat(fileName) {
  const permDir = getDirectory(permanentFS, currentPath);
  const localDir = getDirectory(localFS, currentPath);
  let content = "";
  // Check localFS first (overrides permanent if exists)
  if (localDir && localDir.files[fileName] !== undefined) {
    content = localDir.files[fileName];
  } else if (permDir && permDir.files[fileName] !== undefined) {
    content = permDir.files[fileName];
  } else {
    return "File not found";
  }
  return content;
}

// ------------------ Shell Memory (for set/print/echo) ------------------
const shellMemory = {};

function mem_set_value(varName, value) {
  shellMemory[varName] = value;
}

function mem_get_value(varName) {
  return shellMemory[varName] || null;
}

// ------------------ Command Processing ------------------
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
help                   Displays all the commands
quit                   Exits the shell (refresh the page to restart)
set VAR STRING         Sets a variable in shell memory
print VAR              Displays the variable's value
echo STRING            Echoes input (supports $VAR substitution)
my_ls                  Lists files/directories in current folder
my_mkdir DIR           Creates a new directory (local only)
my_touch FILE          Creates a new file (local only)
my_cd DIR              Changes directory (supports ".." to go back)
cat FILE               Displays the contents of a file
`;
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
    case "cat":
      if (args.length !== 2) {
        response = "Unknown command";
      } else {
        response = cat(args[1]);
      }
      break;
    case "source":
      response = "source command is not implemented in this demo.";
      break;
    case "run":
      response = "run command is not supported in this browser-based shell.";
      break;
    default:
      response = "Unknown command: " + command;
  }

  // Append the command and response to output.
  outputDiv.textContent += "$ " + cmd + "\n" + response + "\n";
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

function disableTerminal() {
  const input = document.getElementById("command-input");
  input.disabled = true;
}

// ------------------ Event Listeners ------------------
document.getElementById("command-input").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    let cmd = this.value.trim();
    if (cmd !== "") {
      processCommand(cmd);
    }
    this.value = "";
  }
});

// Display a welcome note on page load.
document.addEventListener("DOMContentLoaded", () => {
  const outputDiv = document.getElementById("output");
  outputDiv.textContent += "Welcome!\nNote: The mkdir and touch commands modify only your local session and will not affect my permanent files.\n\n";
});
