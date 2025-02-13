## ReceiptX
Sick of keeping records of your receipts and manage expenses? Well there is a solution to everything and ReceiptX adresses this issue by using ML models special trained for this type of operations, Google Cloud Vision API and some refined Regex patterns to extract all the relevant information from your receipt and categorise your expenses. All you need to do is take a photo of your receipt and upload it on the app and let it handle all the hassle for you.

<div align="center">
  <img src="https://private-user-images.githubusercontent.com/75125226/410579986-74a6bb72-a3a9-44d7-997b-230718fd6dd7.gif?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mzg5MzIyNDYsIm5iZiI6MTczODkzMTk0NiwicGF0aCI6Ii83NTEyNTIyNi80MTA1Nzk5ODYtNzRhNmJiNzItYTNhOS00NGQ3LTk5N2ItMjMwNzE4ZmQ2ZGQ3LmdpZj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTAyMDclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwMjA3VDEyMzkwNlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPThlM2I2ZjI2OGM2YzIxMjMwM2MyYTgyOWI1MTU5YmNjMGIzNjU1OGZkY2FiOWVjMTY4MjBhY2QyYjFjZTRlNDMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.2FDaojjZ7EGFmkJbwDNFtikw9giG4qQJ7moKxpksdEQ" width="570"/>
</div>

## Tech Stack
![C#](https://img.shields.io/badge/c%23-%23239120.svg?style=for-the-badge&logo=csharp&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white) ![.Net](https://img.shields.io/badge/.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white) ![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white) ![Chart.js](https://img.shields.io/badge/chart.js-F5788D.svg?style=for-the-badge&logo=chart.js&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white) ![MicrosoftSQLServer](https://img.shields.io/badge/Microsoft%20SQL%20Server-CC2927?style=for-the-badge&logo=microsoft%20sql%20server&logoColor=white) ![Adobe XD](https://img.shields.io/badge/Adobe%20XD-470137?style=for-the-badge&logo=Adobe%20XD&logoColor=#FF61F6) ![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white) ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

## 🚀 Features

- Add receipts linked to your account seamlessly by uploading the photo of the receipt and crop the image so that it doesn't pick up any unwanted text from the background.

<div align="center">
  <img src="https://private-user-images.githubusercontent.com/75125226/410580039-3708fa78-9889-46e5-92f5-b1c3fedc3183.gif?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mzg5Mzk2NzUsIm5iZiI6MTczODkzOTM3NSwicGF0aCI6Ii83NTEyNTIyNi80MTA1ODAwMzktMzcwOGZhNzgtOTg4OS00NmU1LTkyZjUtYjFjM2ZlZGMzMTgzLmdpZj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTAyMDclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwMjA3VDE0NDI1NVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWNlNjYwMTUwYjY2NWJlZjc1NjhjZmNjMmVmNDIwZjg4MGE4ZWQ0YmEyZTIwMDBkMWM3MDliNmI0MjAxZjEzMjUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.eKLsIHef_NUC3DR6hTvwz19_NfEvUtKfHAU6HLNQYcw" width="570"/>
</div>

- See stats about your expenses. This feature is not yet fully implemented as it is at about 80% ready. All is left to do is creating the refined regex patterns which will serve  as the last filter regarding the refining of data extracted from receipts.

<div align="center">
  <img src="https://private-user-images.githubusercontent.com/75125226/410957255-76ed23a3-a354-4d63-998d-23aa86831c91.gif?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mzg5NDAwOTYsIm5iZiI6MTczODkzOTc5NiwicGF0aCI6Ii83NTEyNTIyNi80MTA5NTcyNTUtNzZlZDIzYTMtYTM1NC00ZDYzLTk5OGQtMjNhYTg2ODMxYzkxLmdpZj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTAyMDclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwMjA3VDE0NDk1NlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTU0ZTcyZWRhNmY3ZmM2YWNhNmUzYTI2Yzc2ODY2ZDhmNDI2MTFlYmI3MjYzZDMxMDc0ZmJkNTA2YjQzYmRlOGMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.MFxK06gYjsdRzWK4MYyhLXr4YpQ9IRUGGIQvEdc9vbU" width="570"/>
</div>

## 🚧 Future features 

### High view of some of the future features

- Display the stores on a map using Google Maps API from where clients made the most recent purchases and suggestions of other relevant stores in the area.
- Allowing client to make a list with the products that he wants to buy and suggest them the most appropiate store based on the total price of the products.
- Keeping records of the recycle labelled bottles and inform them with the total value that they can redeem if they recycle them.
- Display a map with all the recycle centers around the area that they live in.
- Give notification related to price increases or decreases based on the most recent entries of similar products that they usually buy.

### More granular future features

- Allowing users to create their own category of products and move relevant items from different categories on the newly created one.
- Allowing users to help the system better decide where a certain product goes by manually introducing the criteria and the details in a pop window when the system is not being able to categorise the product.
- Automate the trainning of ML models by doing it on a daily basis with the new data as the number of users grows and more data is available and by doing so the accuracy of results can increase naturally.
- Add 3rd party authentication methods such as Google, Facebook and Email.
- Improve security against XSS attacks and better manage JWT tokens by adding extra steps of security such as JWT refresh token.

## 🛠️ Usage

You can download the zip file from this repository and just run it on visual studio. 
--IMPORTANT POINT! You won't be able to access the dasboard section and neither the login because the database connection string will most probably be on azure secrets once deployed. My suggestion is to create an in memory data base, change the connection string in the Program.cs and run a migration from the respective folder. Bear in mind that data will be deleted once the app is closed. If you prefer data persistance build a local SQL Server database and you are good to go.
- Also if you really want to work on the backend services I can give full access to Google Cloud Vision API key. Just message me on the contact details here: [![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://linkedin.com/in/www.linkedin.com/in/balan-andrei-43222a260) [![email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:abalan91@yahoo.com) 
## 🤝 Contributing
ReceiptX aims to become a real user friendly app that will allow users to manage all their expenses in one place, with real time price changes, suggestions of similar products on a lower price and many more features and I would love more people to get involved in the project. Whether you have ideas to share, bugs to report, or features to implement, your contributions are welcome!

### How to Contribute
1. **Propose Ideas and Discuss Features:**
   - You can open a topic by [openning a new discussion](https://github.com/andulica/ReceiptsApp/discussions/new/choose).

2. **Report Bugs:**
   - Found a bug? [Open an issue](https://github.com/andulica/ReceiptsApp/issues). Include details, reproduction steps, and any relevant screenshots or logs.

3. **Implement Features:**
   - Indicate your intent to work on a feature by commenting in the [feature discussion](https://github.com/andulica/ReceiptsApp/discussions/3) or starting a new one if it doesn't exist. This helps avoid duplicated efforts and allows maintainers to provide guidance.
   - Fork the repository and branch off `feature`.
   - Implement your feature following the project’s coding standards.
   - [Open a pull request](https://github.com/andulica/ReceiptsApp/pulls) targeting the `feature` branch.

## Code Style and Commit Messages

- **Code Formatting:** Use `clang-format` to ensure consistency. Many editors can apply `clang-format` automatically when saving.
- **Commit Messages:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) style to maintain a clear and informative history:
  - `feat`: New features.
  - `fix`: Bug fixes.
  - `docs`: Documentation updates.
  - `style`: Code style changes.
  - `refactor`: Refactoring without changing functionality.
  - `test`: Adding or modifying tests.
  - `chore`: Maintenance tasks.
  - `merge`: Merging branches or pull requests. Examples:
    - `merge: feature-branch-xxx into feature-branch`
    - `merge: remote feature-branch into local feature-branch`
    - `merge: pull request #12 from feature-branch`
