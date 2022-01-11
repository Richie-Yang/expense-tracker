# Expense Tracker

Expense Tracker, the web service which provides really simple financial records management. This project is built upon Express.js with several well known modules, such as Passport, nodemailer, and so on.


## Screenshots
### Index view
![Index Page](https://github.com/Richie-Yang/expense-tracker/blob/main/public/image/core-dev-1-index.png)
### Login view
![Login Page](https://github.com/Richie-Yang/expense-tracker/blob/main/public/image/core-dev-2-login.png)


## Features
1. User can register and use their account to login.
2. User can sort all records based on fixed categories.
3. User can create/view/edit/delete(CRUD) records.


## Prerequisites
1. Node.js (v14.16.0 is recommended)
2. GitBash or CMder (for Windows) / terminal (for MacOS)
3. Email Account (Gmail is recommended as it's tested)


## Installation
1. Open your terminal, then clone the repo to your local.
```
git clone https://github.com/Richie-Yang/expense-tracker.git
```
2. Move to repo directory.
```
cd expense-tracker
```
3. Run the command below to start installing dependencies.
```
npm install
```
4. Create .env file at project root directory
```
touch .env
```
or
```
cp .env.example .env
```
5. Fill out valid string referring to .env.example

6. Make sure SMTP email service is working properly

#### In order to have email verification work properly, you must provide valid SMTP credentials as SMTP host. If you decide to use Google as email service provider, please login to gmail account and enable 'less secure APP access' and '2 step authentication', then finallly enable APP password, that APP password will be used as SMTP_USER_PASSWORD in .env. More detail can be checked below:

[How to make less secure APP access Gmail service](https://support.google.com/accounts/answer/6010255?authuser=1&p=less-secure-apps&hl=en&authuser=1&visit_id=637774791101502056-4293814723&rd=1)

[How to sign into Gmail service with APP password](https://support.google.com/accounts/answer/185833?hl=en)


## Execution
1. Run below script to add seed data. 

(Every time you run it, the previous seed data will be overwritten)
```
npm run seed
```
2. Start Express server in Node.js env.
```
npm run start
```
or

3. Start Express server in dev mode, which uses nodemon to start server.
```
npm run dev
```
PS: If you don't have nodemon installed, please check [Nodemon](https://www.npmjs.com/package/nodemon) first.


## Usage
1. Open your browser and go to http://127.0.0.1:3000.
2. Click register button to create new account.
3. If you did run 'npm run seed' previously, seed user credentials below are available for use:

First seed user
```
email: user1@example.com
password: 12345678
```

Second seed user
```
email: user2@example.com
password: 12345678
```


## All Branches
* 2022/1/11 core-dev


## Other Screenshots
### Edit view
![Edit Page](https://github.com/Richie-Yang/expense-tracker/blob/main/public/image/core-dev-3-edit.png)
### Verify view (Email Sent)
![Verify Email](https://github.com/Richie-Yang/expense-tracker/blob/main/public/image/core-dev-4-verify-sent-r1.png)
### Verify view (Failure)
![Verify Email](https://github.com/Richie-Yang/expense-tracker/blob/main/public/image/core-dev-5-verify-fail-r1.png)


## Contributor
[Richie](https://github.com/Richie-Yang) :wink:
