# Spotify Controller for VS Code (Linux)

A lightweight Visual Studio Code extension that allows you to control the Spotify Desktop App directly from your status bar. Built specifically for Linux users using DBus integration.

## 📸 Preview
*(You can upload a screenshot of your status bar here later)*

## ✨ Features
* **Play / Pause:** Toggle playback with a single click. Dynamic icon changes based on status (`▶` / `||`).
* **Next / Previous:** Skip tracks instantly.
* **Live Metadata:** Displays the current Song Name and Artist in **Spotify Green**.
* **Search:** Click the search icon to open a command box, type a song name, and play it immediately.
* **Linux Native:** Uses `dbus-send` for zero-latency control without needing a Spotify Web API token.

## 🚀 Requirements
This extension uses the **MPRIS** (Media Player Remote Interfacing Specification) standard via DBus.
* **OS:** Linux (tested on Linux Mint/Ubuntu).
* **App:** Spotify Desktop Application must be running.
    * *Note: This does not work with the Spotify Web Player in a browser.*

## 📦 Installation

### From Source
1.  Clone the repository:
    ```bash
    git clone [https://github.com/yourusername/spotify-control.git](https://github.com/yourusername/spotify-control.git)
    cd spotify-control
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Open in VS Code:
    ```bash
    code .
    ```
4.  Press **F5** to launch the Extension Development Host.

### Build Installer (.vsix)
To generate an installer file for personal use:
```bash
npm install -g vsce
vsce package
