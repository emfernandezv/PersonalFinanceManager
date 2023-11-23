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

// Your Firebase configuration
const firebaseConfig = {
  // Your Firebase configuration details here
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

// Authentication State Listener
auth.onAuthStateChanged(user => {
  if (!user) {
    // Redirect to login page if not authenticated
    window.location.href = 'index.html';
  }
});

// Load transactions using the userId obtained from the URL
if (userId) {
  loadTransactions(userId);
 
   } else {
  console.error('User ID not found in the URL.');
  // Handle the situation when user ID is not found in the URL
}

let dataSource = {};

function loadTransactions(userId) {
  const transactionsRef = database.ref(`transactions/${userId}`);
  const yearFilter = document.getElementById('yearFilter');
  
  return transactionsRef.once('value')
    .then((snapshot) => {
      const transactions = snapshot.val();
      dataSource = transactions;
      const filteredData = dataFilter('All Years')
      displayPieChart(filteredData);
      populateYearFilter();
      yearFilter.addEventListener('change', function () {
        const filteredData = dataFilter(yearFilter.value)
        displayPieChart(filteredData);
      });
    })
    
};

function populateYearFilter() {
  const yearFilter = document.getElementById('yearFilter');
  yearFilter.innerHTML = '<option value="All Years">All Years</option>';

  const years = Object.values(dataSource)
    .map(transaction => new Date(transaction.date).getFullYear())
    .filter((value, index, self) => self.indexOf(value) === index);

  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}

function dataFilter(year) {
  if (year === 'All Years') {
    return Object.values(dataSource).map(({ type, value }) => ({ type, value: parseFloat(value) }));
  } else {
    return Object.values(dataSource)
      .filter(transaction => new Date(transaction.date).getFullYear().toString() === year)
      .map(({ type, value }) => ({ type, value: parseFloat(value) }));
  }
}

;
// Function to display the pie chart
let pieChart = null;

function displayPieChart(filteredData) {
    if (pieChart) {
    pieChart.destroy();
  }
  const transactionTypes = filteredData.map(transaction => transaction.type);
  const transactionValues = filteredData.map(transaction => transaction.value);

  const uniqueTypes = [...new Set(transactionTypes)];

  const aggregatedValues = uniqueTypes.map(type =>
    transactionValues.reduce((acc, val, index) => (transactionTypes[index] === type ? acc + val : acc), 0)
  );

  const data = {
    labels: uniqueTypes,
    datasets: [{
      label: 'Transaction Types',
      data: aggregatedValues,
      backgroundColor: [
        'rgba(99,255,128)',
        'rgba(255,128,99)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        // Add more colors as needed for different types
      ],
      borderWidth: 1,
    }],
  };

  const pieChartCanvas = document.getElementById('pieChart');
  pieChart = new Chart(pieChartCanvas, {
    type: 'doughnut',
    data: data,
    options: {
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxHeight: 100,
            boxWidth: 100,
            font: {
              size: 40
            }
          }
        },
        tooltip:{
          titleFont: {
              size: 30
            },
          bodyFont: {
              size: 30
            }
          }
        }
      ,
      animations: {
        tension: {
          duration: 0,
          easing: 'linear',
          from: 1,
          to: 0,
          loop: false
        }
      }
    }
  })
};



const transactionsButton = document.getElementById('transactions');


transactionsButton.addEventListener('click', function() {
  if (userId) {
    window.location.href = 'transactions.html?token=' + userId;
  } else {
    console.error('User not authenticated.');
    // Handle the situation when the user is not authenticated
  }
});


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