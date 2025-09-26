!macro customInstall
    nsExec::ExecToLog 'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\resources\scripts\TaskSchedSetup.ps1"'
!macroend

!macro customUnInstall
    nsExec::ExecToLog 'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\resources\scripts\TaskSchedUninstall.ps1"'
!macroend