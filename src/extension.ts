import * as vscode from 'vscode';
import * as cp from 'child_process';

// UI ELEMENTS
let playPauseBtn: vscode.StatusBarItem;
let nextBtn: vscode.StatusBarItem;
let prevBtn: vscode.StatusBarItem;
let searchBtn: vscode.StatusBarItem;

let intervalId: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {

    // --- COMMANDS (Logic) ---
    let toggleCmd = vscode.commands.registerCommand('spotify.toggle', () => {
        runDbus('org.mpris.MediaPlayer2.Player.PlayPause');
        setTimeout(updateStatus, 500); 
    });

    let nextCmd = vscode.commands.registerCommand('spotify.next', () => {
        runDbus('org.mpris.MediaPlayer2.Player.Next');
        setTimeout(updateStatus, 500);
    });

    let prevCmd = vscode.commands.registerCommand('spotify.prev', () => {
        runDbus('org.mpris.MediaPlayer2.Player.Previous');
        setTimeout(updateStatus, 500);
    });

    let searchCmd = vscode.commands.registerCommand('spotify.search', async () => {
        const query = await vscode.window.showInputBox({
            placeHolder: 'Search for a song...',
            prompt: 'Spotify Search'
        });
        if (query) {
            runDbus(`org.mpris.MediaPlayer2.Player.OpenUri string:"spotify:search:${query}"`);
            setTimeout(updateStatus, 1000);
        }
    });

    // --- UI SETUP (The Aesthetic Part) ---

    // 1. PREV BUTTON (Simple Arrow)
    prevBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 9003);
    prevBtn.command = 'spotify.prev';
    prevBtn.text = "$(chevron-left)"; // Minimalist icon
    prevBtn.tooltip = "Previous";
    prevBtn.show();

    // 2. MAIN DISPLAY (Song Name + Color)
    playPauseBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 9002);
    playPauseBtn.command = 'spotify.toggle';
    playPauseBtn.text = "$(play) Loading..."; 
    playPauseBtn.color = "#1db954"; // <--- SPOTIFY GREEN COLOR!
    playPauseBtn.tooltip = "Play / Pause";
    playPauseBtn.show();

    // 3. NEXT BUTTON (Simple Arrow)
    nextBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 9001);
    nextBtn.command = 'spotify.next';
    nextBtn.text = "$(chevron-right)";
    nextBtn.tooltip = "Next";
    nextBtn.show();

    // 4. SEARCH BUTTON (Icon Only)
    searchBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 9000);
    searchBtn.command = 'spotify.search';
    searchBtn.text = "$(search)"; // Removed the word "Search" to be cleaner
    searchBtn.tooltip = "Search Spotify";
    searchBtn.show();

    context.subscriptions.push(toggleCmd, nextCmd, prevCmd, searchCmd);
    context.subscriptions.push(playPauseBtn, nextBtn, prevBtn, searchBtn);

    // Start Logic
    updateStatus();
    intervalId = setInterval(updateStatus, 5000);
}

export function deactivate() {
    if (intervalId) { clearInterval(intervalId); }
}

function runDbus(action: string) {
    const command = `dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 ${action}`;
    cp.exec(command, (err) => { if (err) console.error(err); });
}

function updateStatus() {
    // We ask for TWO things now: Metadata AND PlaybackStatus
    const command = 'dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.GetAll string:"org.mpris.MediaPlayer2.Player"';

    cp.exec(command, (err, stdout) => {
        if (err) {
            playPauseBtn.text = "$(circle-slash)";
            playPauseBtn.color = undefined; // Reset color if closed
            return;
        }

        // 1. Get Song Info
        const songMatch = stdout.match(/xesam:title"\s+variant\s+string\s+"([^"]+)"/);
        const artistMatch = stdout.match(/xesam:artist"\s+variant\s+array\s\[\s+string\s+"([^"]+)"/);
        
        // 2. Get Status (Playing vs Paused)
        const statusMatch = stdout.match(/PlaybackStatus"\s+variant\s+string\s+"([^"]+)"/);
        const isPlaying = statusMatch ? statusMatch[1] === "Playing" : false;

        const songName = songMatch ? songMatch[1] : "Unknown";
        const artistName = artistMatch ? artistMatch[1] : "";

        // 3. Clean Format
        let label = `${songName} • ${artistName}`; // Using a bullet dot looks nicer than dash
        if (label.length > 30) label = label.substring(0, 27) + "...";
        
        // 4. Dynamic Icon (Show Pause icon if playing, Play icon if paused)
        const icon = isPlaying ? "$(debug-pause)" : "$(play)";
        
        playPauseBtn.text = `${icon}  ${label}`;
    });
}