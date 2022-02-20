
for($i=1; $i -le 50; $i++){
Write-Host $i
$Response = Invoke-RestMethod -Method Get  -URI https://qmiwmnoo8l.execute-api.sa-east-1.amazonaws.com/dev/notifications-api/notifications/?userid=2  -Headers @{"x-api-key"=""}
}
