
ng build --configuration=production

aws s3 rm s3://notifications-front-001 --recursive
Get-ChildItem .\dist\angular-notifications-front | 
Foreach-Object {
    $file = $_;
    if($file  -like '*.js'){
        aws s3 cp "dist/angular-notifications-front/$file" s3://notifications-front-001 --content-type application/javascript
    }
    else{
        aws s3 cp "dist/angular-notifications-front/$file" s3://notifications-front-001
    }
    Write-host "dist/angular-notifications-front/$file"
}
Write-Host "Deploy finished"

aws cloudfront create-invalidation --distribution-id E5VWY2U81QOQ9  --paths "/*"

