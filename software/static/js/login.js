const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');

if (error === '1') {
    $('#errorMessage').text('Invalid username or password');
}