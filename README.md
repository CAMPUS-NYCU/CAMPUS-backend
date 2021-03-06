# Overview
- In the directory `functions/`

## Installation
- First you need to install all the necessary packages. Run the following command in the directory `functions`:
  ```bash
  npm install
  ```

## Running, locally
- 在run之前，要先下載專案的 service accounts file，並設定環境變數`GOOGLE_APPLICATION_CREDENTIALS`。[參考這裡](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- 設定好之後，切換到`[...]/SmartCampus/functions/graphql_server`底下，透過以下指令開啟
  ```bash
  npm run localstart
  ```
- local server開啟後可以做測試
- playground: http://localhost:4001/graphql
  - 查看schema
  - 手動送出query/mutation做測試
- voyager: http://localhost:4001/voyager
  - 查看shcema的關係

## Deployment
- 在最一開始想先安裝firebase-tools和initialize，參考[get started](https://firebase.google.com/docs/functions/get-started) step 2 and 3
- 完成更動後，跑下面的指定把更動部署到cloud function上
  ```bash
  firebase deploy --only functions
  ```

## Tools
- Programming language: node.js
- API framework: Express + Apollo graphql server
- API schema visualizer: GraphQL voyager
- Database: firebase firestore + firebase Admin SDK
- Deploy on: firebase cloud function

## reference

### Apollo graphql server

- [Apollo graphql tutorial](https://www.apollographql.com/docs/tutorial/introduction/)
- [GraphQL Server Tutorial with Apollo Server and Express](https://www.robinwieruch.de/graphql-apollo-server-tutorial)

### firebase
- [official documentation](https://firebase.google.com/docs)