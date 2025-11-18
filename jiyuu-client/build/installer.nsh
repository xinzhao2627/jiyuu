!include 'LogicLib.nsh'
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
