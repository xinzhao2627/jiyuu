!macro customInstall
    nsExec::ExecToLog 'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\resources\scripts\TaskSchedSetup.ps1"'
!macroend

!macro customUnInstall
    nsExec::ExecToLog 'powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -Command "Unregister-ScheduledTask -TaskName \"JiyuuClientWatchdog\" -Confirm:$$false -ErrorAction SilentlyContinue"'
!macroend