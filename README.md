#SwanHomeAuto

Home Automation by Raspberry Pi 2

(Node.js, DHT11 Temperature/Humidity sensor, GPIO, Relay)


###Install
1.nodejs
```
sudo apt-get install nodejs
```
2.mysql
```
sudo apt-get install mysql-server mysql-client
```
3.add mysql user
```
mysql> create user homeserver@localhost;
```
4.add database
```
mysql> create database homeserver;
mysql> grant all privileges on homeserver.* to homeserver@localhost;
```
5.add table
```
mysql> create table users (name VARCHAR(20), password VARCHAR(255));
```
6.reCAPTCHA (https://www.google.com/recaptcha/intro/index.html)

edit config/recaptcha-info.js
```
var recaptcha_info = {
    recaptcha_url : 'https://www.google.com/recaptcha/api/siteverify',
    recaptcha_sitekey : 'Your Site key',
    recaptcha_secret : 'You Secret key'
};
```
 

