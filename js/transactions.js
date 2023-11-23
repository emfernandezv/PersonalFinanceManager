

const dashButton = document.getElementById('dashboard');

dashButton.addEventListener('click', function() {
  if (userId) {
    window.location.href = `dashboard.html?token=${userId}`;
  } else {
    //console.error('User not authenticated.');
    // Handle the situation when the user is not authenticated
  }
});

// Function to extract query parameters from URL
function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return null;
}

// Retrieve the value of 'TOKEN' from the URL
const userId = getQueryVariable('token');

const firebaseConfig = {
  apiKey: "AIzaSyBRatLckDvdHNy2uXjt3GQdQksupfPsbGQ",
  authDomain: "personalfinancemanager-ef.firebaseapp.com",
  databaseURL: "https://personalfinancemanager-ef-default-rtdb.firebaseio.com",
  projectId: "personalfinancemanager-ef",
  storageBucket: "personalfinancemanager-ef.appspot.com",
  messagingSenderId: "421180425222",
  appId: "1:421180425222:web:7312db316d3e8aa0876f87",
  measurementId: "G-RY5P7FVSDZ"
  };
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();
const transactionForm = document.getElementById('registrationForm');

// Authentication State Listener
auth.onAuthStateChanged(user => {
  if (!user) {
    // Redirect to login page if not authenticated
    window.location.href = 'index.html';
  }
});

// Function to get current date in 'YYYY-MM-DD' format
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Set current date as the default value for the date input field
document.getElementById('date').value = getCurrentDate();

function pushToFireBase(db,typeO,descO,valO,datO){
  return new Promise((resolve, reject) => {
    //Reference to the transactions of a specific user
    const transactionsRef = db.ref(`transactions/${userId}`);
    // Push a new transaction with an automatically generated unique ID
    const newTransactionRef = transactionsRef.push();
    // Data for the new transaction
    const transactionData = {
      type: typeO,
      description: descO,
      value: valO,
      date: datO,
    };

    newTransactionRef
      .set(transactionData)
      .then(() => {
        resolve(newTransactionRef.key);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Function to load transactions based on the user ID
function loadTransactions(userId) {
  const transactionsRef = database.ref(`transactions/${userId}`);
  const table = document.getElementById('transactionList').getElementsByTagName('tbody')[0];
  
  transactionsRef
    .once('value')
    .then((snapshot) => {
      const transactions = snapshot.val();

      if (transactions) {
        snapshot.forEach((transactionSnapshot) => {
          const transactionKey = transactionSnapshot.key;
          const transaction = transactionSnapshot.val();

          const newRow = table.insertRow(table.rows.length);

          const cell1 = newRow.insertCell(0);
          const cell2 = newRow.insertCell(1);
          const cell3 = newRow.insertCell(2);
          const cell4 = newRow.insertCell(3);
          const cell5 = newRow.insertCell(4);
          const cell6 = newRow.insertCell(5);

          newRow.setAttribute('data-id', transactionKey);
          cell1.textContent = transactionKey;
          cell2.textContent = transaction.type;
          cell3.textContent = transaction.description;
          cell4.textContent = transaction.value;
          cell5.textContent = transaction.date;
          cell6.innerHTML = '<button class="editBtn">Edit</button><button class="deleteBtn">Delete</button>';
        });
          // Update totals and toggle visibility of sum rows after loading transactions
          updateTotals();
          toggleSumRows();
      }
    })
    .catch((error) => {
      console.error('Error fetching transactions:', error);
    });

    
}

// Function to populate form fields with row data for editing
function populateFormForEditing(row) {
    const cells = row.querySelectorAll('td:not(:last-child)');
    const form = document.getElementById('registrationForm');
    

    form.elements.id.value = row.getAttribute('data-id');
    form.elements.type.value = cells[1].textContent.trim();
    form.elements.description.value = cells[2].textContent.trim();
    form.elements.value.value = cells[3].textContent.trim();
    form.elements.date.value = cells[4].textContent.trim();
}


// Event delegation to handle edit/save button clicks
document.getElementById('transactionList').addEventListener('click', function (event) {
    const target = event.target;
    if (target.classList.contains('editBtn')) {
        const row = target.parentNode.parentNode;
        populateFormForEditing(row);
    } 
});

// Function to handle row deletion when the delete button is clicked
function deleteRow(event) {
    const row = event.target.parentNode.parentNode;
    row.parentNode.removeChild(row);
    const transactionRef = database.ref(`transactions/${userId}/${row.dataset.id}`);

    // Remove the transaction data at the specified reference
    transactionRef.remove()
      .then(() => {
        console.log('Transaction data removed successfully.');
      })
      .catch((error) => {
        console.error('Error removing transaction data:', error);
      });
}

// Event delegation to handle delete button clicks
document.getElementById('transactionList').addEventListener('click', function (event) {
    if (event.target.classList.contains('deleteBtn')) {
        deleteRow(event);
    }
});

// Function to add a new transaction to the list or update an existing one
document.getElementById('registrationForm').addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent the default form submission behavior

  const id = this.elements.id.value;
  const type = this.elements.type.value;
  const description = this.elements.description.value;
  const value = this.elements.value.value;
  const date = this.elements.date.value;

  const table = document.getElementById('transactionList').getElementsByTagName('tbody')[0];
  const existingRow = document.querySelector(`#transactionList [data-id="${id}"]`);

  if (existingRow) {
      UpdateToFireBase(database,id,type,description,value,date);
  } else {
      pushToFireBase(database,type,description,value,date);
      
  }
  
  // Clear the form fields and table after submission
  this.reset();
  document.querySelectorAll("table tbody tr").forEach(function(e){e.remove()})
  //Reload table
  loadTransactions(userId);

  // Set current date as the default value for the date input field
  document.getElementById('date').value = getCurrentDate();

  // Update totals and toggle visibility of sum rows
  updateTotals();
  toggleSumRows();
});


// Function to calculate and update totals per type
function updateTotals() {
  const incomeTotalCell = document.getElementById('incomeTotal');
  const expenseTotalCell = document.getElementById('expenseTotal');
  let incomeTotal = 0;
  let expenseTotal = 0;

  const rows = document.querySelectorAll('#transactionList tbody tr');
  rows.forEach(row => {
    const type = row.cells[1].textContent.trim();
    const value = parseFloat(row.cells[3].textContent.trim());

    if (type === 'INCOME') {
      incomeTotal += value;
    } else if (type === 'EXPENSE') {
      expenseTotal += value;
    }
  });

  incomeTotalCell.textContent = incomeTotal.toFixed(2);
  expenseTotalCell.textContent = expenseTotal.toFixed(2);
}


// Function to toggle visibility of sum rows based on filter selection
function toggleSumRows() {
  const filterType = document.getElementById('filterType').value;
  const sumRows = document.querySelectorAll('.sumRow');

  sumRows.forEach(row => {
      const rowType = row.getAttribute('data-type');
      if (filterType === 'all' || filterType === rowType) {
          row.style.display = 'table-row';
      } else {
          row.style.display = 'none';
      }
  });

  const rows = document.querySelectorAll('#transactionList tbody tr');

  rows.forEach(row => {
      const rowType = row.cells[1].textContent.trim();
      if (filterType === 'all' || filterType === rowType) {
          row.style.display = 'table-row';
      } else {
          row.style.display = 'none';
      }
  });
}

// Event listener for filter type change
document.getElementById('filterType').addEventListener('change', function () {
toggleSumRows();
});

// Event listener for initial load and changes in transaction list
document.addEventListener('DOMContentLoaded', function () {
  updateTotals();
});

function UpdateToFireBase(db,id,typeO,descO,valO,datO){
  // Add this user to Firebase Database
  var database_ref = db.ref()
  
  // Create Transaction
  var data = {
    type: typeO,
    description: descO,
    value: valO,
    date: datO
  }

  // Push to Firebase Database
  database_ref.child('transactions/' + userId +'/'+id+'/').update(data)
}

// Load transactions using the userId obtained from the URL
 if (userId) {
  loadTransactions(userId);
} else {
  console.error('User ID not found in the URL.');
  // Handle the situation when user ID is not found in the URL
}

//logout
function logout() {
  auth.signOut().then(() => {
    // Sign-out successful.
    window.location.href = 'index.html'; // Redirect to login or any other page
  }).catch((error) => {
    // An error happened.
    console.error('Error logging out:', error);
  });
}

//event Listener to the logout button
const logoutButton = document.getElementById('logout'); 
logoutButton.addEventListener('click', logout);