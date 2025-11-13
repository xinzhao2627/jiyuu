
$AppPath = "$env:USERPROFILE\AppData\Local\Programs\jiyuu\jiyuu.exe"
$Action = New-ScheduledTaskAction -Execute $AppPath -Argument "--auto-start"
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 3650)
# $settings = New-ScheduledTaskSettingsSet -Hidden -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
# $ST = New-ScheduledTask 
$TaskName = "JiyuuClientWatchdog";

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Force 