/* ------------------ File System Setup ------------------ */
// Permanent file system (read-only files; external files that you can edit separately in the repo)
const permanentFS = {
  "/": {
    files: {},
    dirs: {
      "aboutMe": {
        files: {
          "resume.txt": { external: true, path: "aboutMe/resume.txt" },
          "contactMe.txt": { external: true, path: "aboutMe/contactMe.txt" }
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

/* ------------------ Helper Functions ------------------ */
function getDirectory(fs, path) {
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

function getCombinedDirectory(path) {
  const permDir = getDirectory(permanentFS, path) || { files: {}, dirs: {} };
  const localDir = getDirectory(localFS, path) || { files: {}, dirs: {} };
  const combinedDirs = { ...permDir.dirs, ...localDir.dirs };
  const combinedFiles = { ...permDir.files, ...localDir.files };
  return { dirs: combinedDirs, files: combinedFiles };
}

/* ------------------ Command Implementations ------------------ */
function ls() {
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

function mkdir(dirName) {
  if (!/^[A-Za-z0-9]+$/.test(dirName)) {
    return "Bad command: mkdir";
  }
  const permDir = getDirectory(permanentFS, currentPath);
  const localDir = getDirectory(localFS, currentPath);
  if ((permDir && permDir.dirs[dirName]) || (localDir && localDir.dirs[dirName])) {
    return "Directory already exists";
  }
  if (!localDir) {
    return "Current directory not found in localFS";
  }
  localDir.dirs[dirName] = { files: {}, dirs: {} };
  return "";
}

function touch(fileName) {
  if (!/^[A-Za-z0-9.]+$/.test(fileName)) {
    return "Bad command: touch";
  }
  const permDir = getDirectory(permanentFS, currentPath);
  const localDir = getDirectory(localFS, currentPath);
  if (permDir && permDir.files[fileName] !== undefined) {
    return "File already exists (permanent)";
  }
  if (localDir.files[fileName] !== undefined) {
    return "File already exists";
  }
  localDir.files[fileName] = "";
  return "";
}

function cd(dirName) {
  if (dirName === "..") {
    if (currentPath === "/") {
      return "Already at root";
    } else {
      let parts = currentPath.split("/").filter(x => x !== "");
      parts.pop();
      currentPath = "/" + parts.join("/");
      if (currentPath === "") currentPath = "/";
      return "";
    }
  } else {
    const permDir = getDirectory(permanentFS, currentPath);
    const localDir = getDirectory(localFS, currentPath);
    const existsInPerm = permDir && permDir.dirs && permDir.dirs[dirName];
    const existsInLocal = localDir && localDir.dirs && localDir.dirs[dirName];
    if (existsInPerm || existsInLocal) {
      currentPath = currentPath === "/" ? "/" + dirName : currentPath + "/" + dirName;
      return "";
    }
    return "Bad command: cd";
  }
}

async function cat(fileName) {
  const permDir = getDirectory(permanentFS, currentPath);
  const localDir = getDirectory(localFS, currentPath);
  // Check localFS first (overrides permanent if exists)
  if (localDir && localDir.files[fileName] !== undefined) {
    return localDir.files[fileName];
  } else if (permDir && permDir.files[fileName] !== undefined) {
    const fileObj = permDir.files[fileName];
    if (typeof fileObj === "object" && fileObj.external) {
      try {
        const response = await fetch(fileObj.path);
        if (response.ok) {
          const text = await response.text();
          return text;
        } else {
          return "Error fetching file: " + response.status;
        }
      } catch (error) {
        return "Error fetching file: " + error;
      }
    } else {
      return fileObj;
    }
  } else {
    return "File not found";
  }
}

/* ------------------ Shell Memory (for set/print/echo) ------------------ */
const shellMemory = {};

function mem_set_value(varName, value) {
  shellMemory[varName] = value;
}

function mem_get_value(varName) {
  return shellMemory[varName] || null;
}

/* ------------------ Command Processing ------------------ */
async function processCommand(cmd) {
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
help            Displays all the commands
quit            Exits the shell (refresh the page to restart)
clear           Clears the terminal output
set VAR STRING  Sets a variable in shell memory
print VAR       Displays the variable's value
echo STRING     Echoes input (supports $VAR substitution)
ls              Lists files/directories in current folder
mkdir DIR       Creates a new directory (local only)
touch FILE      Creates a new file (local only)
cd DIR          Changes directory (supports ".." to go back)
cat FILE        Displays the contents of a file
`;
      break;
    case "quit":
      response = "Bye!";
      disableTerminal();
      break;
    case "clear":
      outputDiv.textContent = "";
      // Do not add any response when clearing.
      return;
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
    case "ls":
      response = ls();
      break;
    case "mkdir":
      if (args.length !== 2) {
        response = "Unknown command";
      } else {
        response = mkdir(args[1]);
      }
      break;
    case "touch":
      if (args.length !== 2) {
        response = "Unknown command";
      } else {
        response = touch(args[1]);
      }
      break;
    case "cd":
      if (args.length !== 2) {
        response = "Unknown command";
      } else {
        response = cd(args[1]);
      }
      break;
    case "cat":
      if (args.length !== 2) {
        response = "Unknown command";
      } else {
        response = await cat(args[1]);
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

  outputDiv.textContent += "$ " + cmd + "\n" + response + "\n";
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

function disableTerminal() {
  document.getElementById("command-input").disabled = true;
}

/* ------------------ Event Listeners ------------------ */
document.getElementById("command-input").addEventListener("keydown", async function(e) {
  if (e.key === "Enter") {
    let cmd = this.value.trim();
    if (cmd !== "") {
      await processCommand(cmd);
    }
    this.value = "";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const outputDiv = document.getElementById("output");
  outputDiv.textContent += "Welcome! Type help to see all commands available to you.\nNote: The mkdir and touch commands modify only your local session and will not affect my permanent files so feel free to play around!\n\n";
});
