# JIYUU

Jiyuu is an free, open‑source, and strict website blocker for windows 11. It offers cross‑browser extension support using the WXT framework.

## General Information

-   System‑level controller, analytics, and configuration for desktop app
-   Real‑time blocking in Chromium/Mozilla‑based browsers using websockets (for the extension)
-   Uninstall prevention in any case that the user would cheat the blocking mechanism
-   Restricted to supported browsers so that users can't bypass the block

## Features

### Jiyuu Desktop App

-   Has an option to ban specific url or keyword
-   Customize the ban/block options with:
    -   <b>Cover:</B> covers entire webpage
    -   <b>Mute:</B> Mute all video elements
    -   <b>Grayscale:</B> Makes your screen boring by removing the colors. (It has scientific evidences that removes bad habits)
    -   <b>Blur:</B> Makes a website blurred
-   Create multiple block groups to organize your banned URLs
-   intuitive UI with detailed analytics.
-   Track website usages on every session
-   Lock your block groups using multiple ways:
    -   <b>Usage Limit:</B> Activates your block group when certain amount of time is used up.
    -   <b>Random Text: </B> Create random text in which you have to type it individually (no copy or paste)
    -   <b>Time Limit: </B> Lock your block group for certain amount of days
    -   <b>Password: </b> Add password to your block groups
-   App restarts automatically no matter what, so you can't forcibly stop Jiyuu.

### Jiyuu Extension

-   Offers support on multiple browsers
-   Scans the url and header of the website, not just the url
-   Forced incognito inclusion so that users can't cheat by going to private windows

## For Developers

You need:

-   node v22.14.0

Clone first:

    git clone https://github.com/xinzhao2627/jiyuu.git

For Electron:

    cd jiyuu

    npm i

    npm run dev

For Extension:

    cd extension

    npm i

    npm run dev

### Caution:

In some instances, apps that manipulates local servers such as WSL, Docker desktop and Kubernetes could mess up the websocket of Jiyuu. In that case you should restart <b>Windows NAT Driver</b> in powershell admin console.

Stop first

    net stop winnat

Then restart

    net start winnat

## Supported Browsers (in-development)

|     Supported browsers      |
| :-------------------------: |
|        Google Chrome        |
| Mozilla Firefox (+variants) |
|            Brave            |
|        Opera Browser        |
|          Opera GX           |
|       Microsoft Edge        |
