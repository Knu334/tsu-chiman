# DISCORDのボイスチャンネル参加時にWebPush通知を送信するBOT
WEBブラウザにてWebPush通知の購読、受信処理を行い、DISCORD BOTにてボイスチャンネルの参加を監視することで通知を送信する

## 動作確認環境
### サーバ
* OS：Ubuntu 20.04.5 LTS 64 bit
* Docker version 20.10.22, build 3a2c30b
* Docker Compose version v2.14.1
* node v16.15.0
* npm v8.5.5

### クライアント
* Google Chrome 108.0.5359.125（Official Build） （64 ビット）

## 前提条件
* DISCORD BOTは作成済みであり、監視対象のDISCORDサーバに参加済みであること（DISCORDトークンが取得できていること）
* 動作サーバの80,443ポートがグローバルネットに公開されていること

## サーバの立ち上げ
### 1. VAPIDキーの生成
[web-push.js](https://github.com/web-push-libs/web-push)をグローバルインストールする
```
npm install web-push -g
```
VAPIDキーの生成を行う
```
web-push generate-vapid-keys
```

### 2. Docker Compose設定ファイルの編集
docker-compose.yaml内のenvironmentとargsの項目を自身の環境にあわせて設定する
<br><br>
### 3. Dockerコンテナの立ち上げ
Dockerコンテナを立ち上げる
```
docker compose --compatibility up -d
```

### 4. データベースの初期化
database/init.sqlをデータベースに反映する

## WebPush通知の購読
### 1. WebPush通知購読用ページURLの取得
DISCORD BOTが参加済みのDISCORDサーバにて下記のスラッシュコマンドを実行し、WebPush通知の購読用ページのURLがDM送信されることを確認する
```
/tsu-chiman
```

### 2. WebPush通知の購読を行う
取得したWebPush通知の購読用ページにアクセスし、「通知登録」ボタンを押下する

## WebPush通知の受信確認
DISCORD BOTが参加済みのDISCORDサーバにてボイスチャンネルに参加することでWebPush通知が受信されるか確認する
