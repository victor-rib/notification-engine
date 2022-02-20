# npm i

Compress-Archive -Path '.\*' -DestinationPath notificationdispatch.zip -Force

# update lambda from zip
aws lambda update-function-code --function-name notifications-dispatch --zip-file fileb://notificationdispatch.zip