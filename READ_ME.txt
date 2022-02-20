-------------------------------- Notification Engine Repository -------------------------------------

Este repositório hospeda todo código utilizado para a solução de gerenciamento de notificações.
As funções Lambda monitoram novas medidas de IoT armazenadas no DynamoDB e de acordo com regras cadastradas no Amazon RDS novas notificações são criadas.
As notificações ficam armazenadas em outra instância do DynamoDB e são enviadas a usuarios cadastrados no MySQL do Amazon RDS.

O repositório é composto pelos seguintes arquivos :

-> Notifications-Flow.png : Imagem descrevendo os serviços utilizados na solução de notificações
-> Pasta FrontEnd : Contem o aplicativo em Angular com as páginas web da aplicação, além do script front-deploy.ps1 para deploy do código
-> Pasta Lambdas : Contém todas as Lambdas utilizadas na solução, assim como seus scripts deploy.ps1 para deploy
-> Lambdas/node-lambda-iot-api : API para gerenciamento de notificações, O script api-tester.ps1 realiza o teste do endpoint que recupera as notificações no DynamoDB
-> Lambdas/node-lambda-iot-creator : Lambda responsável pela criação de alertas
-> Lambdas/node-lambda-iot-addresser : Lambda responsável pelo endereçamento de alertas
-> Lambdas/node-lambda-iot-dispatch : Lambda responsável pelo envio de alertas
-> SQLScripts.txt : T-SQL para criação das tabelas do banco RDS- MySQL.