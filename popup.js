document.addEventListener("DOMContentLoaded",  function() {
    const passwordInput = document.getElementById("test-password");
    const passwordButton = document.getElementById("test-button");
    const dummyDisplay = document.getElementById("display");
    
    passwordButton.addEventListener("click", (e) => {
        const password = passwordInput.value;
        dummyDisplay.innerText = "Hark!, Good Password: " + password;
    });
});
