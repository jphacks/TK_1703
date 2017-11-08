### setup reaspberry pi

```shell
$ sudo apt-get update
$ sudo apt-get install -y nodejs npm git
$ sudo npm cache clean
$ sudo npm install npm n -g
$ sudo n lts
$ echo export PATH='/usr/local/bin:$PATH' >> ~/.bash_profile
$ source ~/.bash_profile
$ git clone https://github.com/jphacks/TK_1703.git
$ cd TK_1703/client #適宜変えてください
$ npm install
$ npm start
```

### コマンド実行

内部でこのコマンドを実行します。

SMELLIDはA~Dのいずれか、AMOUNTは自然数で量指定
```shell
../pi/spoutSmell SMELLID AMOUNT
```
