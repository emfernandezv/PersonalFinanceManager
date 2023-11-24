
let auth = "";
let database_ref = "";

//read the configuration from the external json file
async function getConfigAndInitializeFirebase() {
  try {
    const response = await fetch('js/credentials.json');
    const firebaseConfig = await response.json();
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    // Initialize variables
    auth = firebase.auth();
    database_ref = firebase.database().ref();
  } catch (error) {
    console.error('Error fetching or initializing Firebase:', error);
  }
}

//starting the connection
getConfigAndInitializeFirebase();


// Set up our register function
function register() {
  const email = document.getElementById('RegisterEmail').value;
  const password = document.getElementById('RegisterPassword').value;
  const fullName = document.getElementById('RegisterFullName').value;

  if (validate_email(email) === false || validate_password(password) === false) {
    alert('Email or Password is invalid!');
    return;
  }

  if (validate_field(fullName) === false) {
    alert('Full Name field is required!');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      const user = auth.currentUser;
      const user_data = {
        email: email,
        full_name: fullName,
        last_login: Date.now()
      };

      database_ref.child('users/' + user.uid).set(user_data);
      alert('Your user was created successfully. Redirecting...');
      // Open a new window and pass the authentication object
      window.location.href = 'dashboard.html?token=' + user.uid;
    })
    .catch((error) => {
      const error_message = error.message;
      console.log(error_message);
      alert("Your user/password is invalid. Please try again");
    });
}

// Set up our login function
function login() {
  const email = document.getElementById('LoginEmail').value;
  const password = document.getElementById('LoginPassword').value;

  if (validate_email(email) === false || validate_password(password) === false) {
    alert('Email or Password is invalid!');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      const user = auth.currentUser;
        const user_data = {
        last_login: Date.now()
      };

      database_ref.child('users/' + user.uid).update(user_data);
      alert('You have logged in successfully.');

      // Open a new window and pass the authentication object
      window.location.href = 'dashboard.html?token=' + user.uid;
    })
    .catch((error) => {
      const error_message = error.message;
      console.log(error_message);
      alert("Your user/password is invalid. Please try again");
    });
}


// Validate Functions
function validate_email(email) {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  return expression.test(email);
}

function validate_password(password) {
  return password.length >= 6;
}

function validate_field(field) {
  return field !== null && field.length > 0;
}

function toggleForm() {
  const loginForm = document.getElementById('login');
  const registerForm = document.getElementById('register');

  loginForm.style.display = loginForm.style.display === 'none' ? 'grid' : 'none';
  registerForm.style.display = registerForm.style.display === 'none' ? 'grid' : 'none';
}
