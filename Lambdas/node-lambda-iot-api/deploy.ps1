
#npm install
Compress-Archive -Path '.\*' -DestinationPath notificationapi.zip -Force

aws lambda update-function-code --function-name notifications-api --zip-file fileb://notificationapi.zip
