## MyTerminal — Custom Browser Shell

**Live Demo:** [codebyksp.github.io/myTerminal](https://codebyksp.github.io/myTerminal/)
**Author:** [Kanika Singh Pundir](https://github.com/codebyksp)

---

## Overview

**MyTerminal** is a lightweight, browser-based shell simulation that mimics a simplified command-line environment using **HTML, CSS, and JavaScript**.
It allows users to explore a pseudo file system, create local directories and files, view external text content (like a résumé), and interact through familiar terminal commands — all within the browser.

This project is a **work in progress**, blending front-end interactivity with basic shell logic for fun experimentation and portfolio presentation.

---

## Features

* **Interactive Shell Interface**

  * Command-based input with dynamic output (supports commands like `ls`, `mkdir`, `cat`, `cd`, `touch`, etc.)
  * Local session persistence for temporary file creation
* **Virtual File System**

  * Combines a *permanent (read-only)* structure with a *local (editable)* one
  * External file linking (e.g., `aboutMe/resume.txt`, `contactMe.txt`)
  * ⚠️ Note: mkdir and touch can only be used in the root directory (/) or in directories you’ve created locally — not inside permanent folders like /aboutMe/.
* **Custom Styling**

  * Terminal UI inspired by classic command prompts
  * Responsive centered layout with a faux top bar and window controls
* **Extensible Design**

  * Built entirely with vanilla JS — easy to extend with new commands or features
* **Embedded Portfolio Links**

  * Email, GitHub, and LinkedIn links displayed at the bottom

---

## Commands Supported

| Command         | Description                                          |
| --------------- | ---------------------------------------------------- |
| `help`          | Displays all available commands                      |
| `quit`          | Exits the shell (disables input until refresh)       |
| `clear`         | Clears terminal output                               |
| `set VAR VALUE` | Stores a variable in shell memory                    |
| `print VAR`     | Displays the value of a stored variable              |
| `echo TEXT`     | Prints text (supports `$VAR` substitution)           |
| `ls`            | Lists files and directories in the current folder    |
| `mkdir DIR`     | Creates a new directory (local only)                 |
| `touch FILE`    | Creates a new file (local only)                      |
| `cd DIR`        | Changes the current directory (`..` to go back)      |
| `cat FILE`      | Displays file contents (fetches external text files) |

---

## Technical Design

### File System Structure

* **Permanent File System (Read-Only)**

  * Predefined directories such as `/aboutMe/` contain external text files (`resume.txt`, `contactMe.txt`)
* **Local File System (Writable)**

  * Initialized empty; stores session-based user-created files/directories
* Both are merged dynamically to simulate a combined environment.

### Shell Memory

Supports `set`, `print`, and `echo` commands to handle basic variable assignment and retrieval.

### Command Processor

Each command is parsed and executed through an asynchronous handler (`processCommand(cmd)`), supporting sequential and fetch-based operations.

---

## UI and Styling

* Built with **CSS (no frameworks)** for simplicity
* Dark-themed terminal with:

  * Faux top bar and window controls
  * Scrollable output area
  * Inline input prompt (`$`)
* Styled using **monospace (Consolas)** for an authentic terminal look

---

## How to Run Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/codebyksp/myTerminal.git
   cd myTerminal
   ```

2. **Open the project:**

   * Simply open `index.html` in your browser.
   * Or serve it locally (optional):

     ```bash
     python3 -m http.server 8000
     ```

     Then go to [http://localhost:8000](http://localhost:8000).

3. **Explore!**

   * Try `help`, `ls`, `cd aboutMe`, `cat resume.txt`, and `mkdir test`.

---

## 🧭 Future Improvements

* [ ] Fix formatting issues in `resume.txt` display
* [ ] Implement persistent storage using `localStorage`
* [ ] Add more realistic command-line utilities (`rm`, `cp`, `mv`)
* [ ] Support syntax highlighting and improved text wrapping
* [ ] Make responsive for mobile devices

---

## 📬 Contact

**Kanika Pundir**
📧 [kanikapundir13@gmail.com](mailto:kanikapundir13@gmail.com)
💼 [LinkedIn](https://www.linkedin.com/in/kanika-singh-pundir-4926bb279/)
💻 [GitHub](https://github.com/codebyksp)

