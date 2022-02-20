#npm install

Compress-Archive -Path '.\*' -DestinationPath notificationcreator.zip -Force

# update lambda from zip
aws lambda update-function-code --function-name notifications-creator --zip-file fileb://notificationcreator.zip