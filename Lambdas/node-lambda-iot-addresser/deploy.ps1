# npm i

Compress-Archive -Path '.\*' -DestinationPath notificationaddresser.zip -Force

# update lambda from zip
aws lambda update-function-code --function-name notifications-addresser --zip-file fileb://notificationaddresser.zip