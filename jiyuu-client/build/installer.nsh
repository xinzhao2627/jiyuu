!include "LogicLib.nsh"
!macro customHeader
  !include "MUI2.nsh"
!macroend
!macro customWelcomePage
    !define MUI_WELCOMEPAGE_TITLE "Welcome to the Jiyuu Client Setup Wizard!"
    !define MUI_WELCOMEPAGE_TEXT "Thank you for installing Jiyuu. $\r$\n$\r$\nThis setup will guide you through the process, which includes setting up a Windows Scheduled Task for monitoring. $\r$\n$\r$\nTake note that the installation is a 1 click process after you click the 'Next' button to prevent errors when installing Jiyuu in your current directory. $\r$\n$\r$\nClick 'Next' to continue."
    !insertmacro MUI_PAGE_WELCOME
!macroend
!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
  StrCpy $isForceMachineInstall "0"
!macroend
!macro customInstall
    nsExec::ExecToLog 'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\resources\scripts\TaskSchedSetup.ps1"'
!macroend

!macro customUnInit
    DetailPrint "Checking for active restriction..."
    ${If} ${FileExists} "$APPDATA\jiyuu\hasRestriction.txt"
        MessageBox MB_ICONEXCLAMATION|MB_OK "Cannot uninstall because there is active restriction. If you think this is a bug, consider visiting jiyuu.app to download the forced uninstaller"
        Abort
    ${EndIf}
!macroend
!macro customUnInstall
    nsExec::ExecToLog 'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -Command "Unregister-ScheduledTask -TaskName \"JiyuuClientWatchdog\" -Confirm:$$false -ErrorAction SilentlyContinue"'
!macroend
