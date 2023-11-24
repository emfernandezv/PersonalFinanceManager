# Personal Finance Manager Overview

This app is intended to demonstrate the connectivity and uses of a Firebase Real Time Data base, authentication, and JavaScript

The PFM, is a Finance Manager that allows the user to log their expenses and incomes. It will display a dashboard piechart filtered by year to visualize graphically how the finances are going. The application allows multiple users and self registration.

[Software Demo Video](https://youtu.be/e1BA7ZpfYE4)

# Cloud Database

Firebase (https://personalfinancemanager-ef-default-rtdb.firebaseio.com/)

The database has 2 main tables:

- User: The table will log the users email, fullname and last login timestamp. It interacts with the native firebase Authentication, when a user is created it is also recorded in this table and when a user is logged in, the last login field will be updated.

- Transactions: the table will log the transactions having the user UID as a node root. The fields are: type, description, value and date.

Additionally, the website also validates when a user has logged out.

The index page loads the Fire credentials from an external Json file.

# Development Environment

- Visual Studio Code

- HTML 5
- CSS
- JavaScript
- Firebase 8.6.8
- ChartJs 4.4.0

# Useful Websites

- [FirerBase](https://firebase.google.com/docs/firestore)
- [Chart.Js](https://www.chartjs.org/docs/latest/)

# Future Work

- make all subpages use the same database object from the index page.
- send the token privately between pages to prevent the unnecesary exposure of the internal key.
- add a "forgot your password?" functionality to the log in.