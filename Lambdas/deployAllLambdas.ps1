cd node-lambda-iot-creator
npm install
Compress-Archive -Path '.\*' -DestinationPath notificationcreator.zip -Force
aws lambda update-function-code --function-name notifications-creator --zip-file fileb://notificationcreator.zip

cd ../node-lambda-iot-addresser
npm install
Compress-Archive -Path '.\*' -DestinationPath notificationdaddresser.zip -Force
aws lambda update-function-code --function-name notifications-addresser --zip-file fileb://notificationdaddresser.zip

<#
cd ../node-lambda-iot-dispatch
npm install
Compress-Archive -Path '.\*' -DestinationPath notificationdispatch.zip -Force
aws lambda update-function-code --function-name notifications-dispatch --zip-file fileb://notificationdispatch.zip

cd../node-lambda-iot-api
npm install
Compress-Archive -Path '.\*' -DestinationPath notificationapi.zip -Force
aws lambda update-function-code --function-name notifications-api --zip-file fileb://notificationapi.zip

#>

