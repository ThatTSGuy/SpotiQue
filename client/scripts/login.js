const params = new URLSearchParams(location.search);

if (params.has('error')) {
    const toast = document.querySelector('.error-toast');
    toast.innerText = 'An error occurred: '+ params.get('error');
    toast.classList.remove('hidden');
}

document.querySelector('.login-btn-container').addEventListener('click', () => {
    location = '/auth/login';
})