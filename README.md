<p align="center">
  <img src=".github/assets/jiyuu banner.png" alt="Jiyuu Banner" width="100%" height="100%" >
</p>

<h1 align="center">Jiyuu</h1>

<p align="center">
  <strong>A free, open-source, and strict website blocker for Windows 11 with cross-browser extension support.</strong>
</p>

<p align="center">
  <a href="https://sourceforge.net/projects/jiyuu-website-blocker/reviews/">
    <img src="https://b.sf-syn.com/badge_img/4094557/oss-users-love-us-black" alt="SourceForge Users Love Us" width="125">
  </a>
  <a href="https://sourceforge.net/projects/jiyuu-website-blocker/">
    <img src="https://b.sf-syn.com/badge_img/4094557/oss-rising-star-black" alt="SourceForge Rising Star" width="125">
  </a>
  <br>
  <a href="https://sourceforge.net/projects/jiyuu-website-blocker/files/latest/download">
    <img src="https://img.shields.io/sourceforge/dt/jiyuu-website-blocker.svg?style=flat-square&logo=sourceforge&logoColor=white&color=f15a24" alt="SourceForge Downloads">
  </a>
  <a href="https://github.com/xinzhao2627/jiyuu/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/xinzhao2627/jiyuu?style=flat-square&color=007ec6" alt="License">
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-%3E%3D22.14.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node Version">
  </a>
</p>

---

## 🏆 SourceForge Recognition & Awards

Jiyuu has been recognized by the open-source community on **SourceForge** with prestigious achievements:

<table>
  <tr>
    <td width="30%" align="center">
      <a href="https://sourceforge.net/projects/jiyuu-website-blocker/">
        <img src="https://b.sf-syn.com/badge_img/4094557/oss-rising-star-black" alt="SourceForge Rising Star" width="150">
      </a>
    </td>
    <td width="70%">
      <h3>SourceForge OSS Rising Star</h3>
      <p>
        Awarded to Jiyuu for demonstrating exceptional growth, rapid user adoption, and community engagement since its launch. This award highlights the project's dedication to providing a high-quality, secure website-blocking solution for Windows.
      </p>
    </td>
  </tr>
</table>

---

## 📖 General Information

Jiyuu is a system-level website blocker designed to help you regain control over your digital habits. By pairing a robust Windows desktop application with a lightweight browser extension, Jiyuu ensures complete blocking coverage without loophole workarounds.

- **System-Level Control**: Desktop-level service, analytics engine, and configuration manager.
- **Real-Time Blocking**: Uses high-speed WebSockets to communicate block lists to Chromium- and Mozilla-based browsers instantly.
- **Tamper-Proof Design**: Employs uninstall and bypass prevention mechanisms to stop you from cheating your blocking rules.
- **Lock Enforcement**: Restricts access to supported browsers, closing options to bypass the blocker using minor browsers.

---

## ✨ Features

### 🖥️ Jiyuu Desktop App

- 🚫 **Domain & Keyword Blocking**: Block specific URLs, complete domains, or custom keywords.
- 🎨 **Custom Blocking Modes**:
    - **Cover**: Completely overlays the blocked webpage.
    - **Mute**: Mutes all audio and video elements automatically.
    - **Grayscale**: Removes colors from the screen to make bad habits less stimulating (scientifically proven to decrease digital impulse).
    - **Blur**: Heavy Gaussian blur filter makes the restricted pages completely unreadable.
- 📁 **Block Groups**: Categorize and manage your blocked domains dynamically.
- 📊 **Intuitive UI & Analytics**: A modern dashboard containing detailed analytics tracking website usage across all active sessions.
- 🔒 **Multi-Method Locking**: Secure your groups with custom rules:
    - **Usage Limit**: Activates blocks automatically when you exceed a certain browsing duration.
    - **Random Typing**: Lock groups until you type a randomly generated string (copy-paste is disabled) to counter impulsive bypass urges.
    - **Time Limit**: Hard-lock settings for a set number of days.
    - **Password**: Protect adjustments with a password.
- 🛡️ **Self-Healing Mechanics**: The application automatically restarts background services if stopped, preventing easy task-kill workarounds.

### 🌐 Jiyuu Browser Extension

- 🧭 **Multi-Browser Sync**: Runs seamlessly across Chrome, Firefox, Edge, Brave, and Opera.
- 🔍 **Deep Request Analysis**: Scans both page URLs and response headers to prevent trick bypass methods.
- 🕶️ **Enforced Incognito Mode**: Enforces installation and execution inside private/incognito windows to prevent loophole usage.

---

## 🛠️ Developer Guide

### Prerequisites

- [Node.js](https://nodejs.org/) v22.14.0 or higher

### Getting Started

1.  Clone the repository:

    ```bash
    git clone https://github.com/xinzhao2627/jiyuu.git
    ```

2.  Run the Desktop App (Electron):

    ```bash
    cd jiyuu
    npm install
    npm run dev
    ```

3.  Run the Browser Extension (WXT):
    ```bash
    cd extension
    npm install
    npm run dev
    ```

> [!CAUTION]
> **WSL, Docker, and Virtualization Conflict**
> In some instances, applications that manipulate local network interfaces (such as WSL, Docker Desktop, or Kubernetes orchestrators) can interfere with the WebSocket server used by Jiyuu.
> If the extension cannot connect to the desktop application, run the following commands in an **Administrator PowerShell** session to restart the Windows NAT Driver:
>
> ```powershell
> # Stop the NAT driver
> net stop winnat
>
> # Start the NAT driver
> net start winnat
> ```

---

## 🌐 Supported Browsers

| Browser                                                                                                                                       | Support Status |
| :-------------------------------------------------------------------------------------------------------------------------------------------- | :------------: |
| <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/70.1.0/chrome/chrome.svg" width="20" height="20"> Google Chrome                |   Supported    |
| <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/70.1.0/firefox/firefox.svg" width="20" height="20"> Mozilla Firefox & variants |   Supported    |
| <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/70.1.0/brave/brave.svg" width="20" height="20"> Brave Browser                  |   Supported    |
| <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/70.1.0/opera/opera.svg" width="20" height="20"> Opera Browser                  |   Supported    |
| <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/70.1.0/opera/opera.svg" width="20" height="20"> Opera GX                       |   Supported    |
| <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/70.1.0/edge/edge.svg" width="20" height="20"> Microsoft Edge                   |   Supported    |

---

## 💻 Tech Stack

- **Desktop Framework**: [Electron](https://www.electronjs.org/) (with [Vite](https://vitejs.dev/)) & [electron-builder](https://www.electron.build/)
- **Frontend**: [React](https://react.dev/) & [Material UI (MUI)](https://mui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [SQLite](https://sqlite.org/) with [Kysely](https://kysely.dev/) query builder
- **Communication**: WebSockets ([ws](https://github.com/websockets/ws)) for real-time app-to-extension communication
- **Browser Extension**: [WXT Framework](https://wxt.dev/) for cross-browser extensions
- **Installer**: [NSIS](https://nsis.sourceforge.io/) (Nullsoft Scriptable Install System)

---

## 📄 License

This project is licensed under the terms of the [GNU General Public License v3.0](LICENSE).
