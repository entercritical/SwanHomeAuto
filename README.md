#SwanHomeAuto

Home Automation (Raspberry Pi, Arduino)

##Install
###nodejs
```
sudo apt-get install nodejs
```
###mysql
```
sudo apt-get install mysql-server mysql-client
```
###add mysql user
```
mysql> create user homeserver;
```
###add database
```
mysql> create database homeserver;`
mysql> grant all privileges on homeserver.* to homeserver@localhost;
```
