document.addEventListener("DOMContentLoaded",  function() {
    const passwordInput = document.getElementById("test-password");
    const passwordButton = document.getElementById("test-button");
    const dummyDisplay = document.getElementById("display");
    
    passwordButton.addEventListener("click", (e) => {
        const password = passwordInput.value;
        dummyDisplay.innerText = "Hark!, Good Password: " + password;
    });

    chrome.runtime.onMessage.addListener( async (message, sender, sendResponse) => {
        const pending = (await chrome.storage.local.get("areInfoPending")).areInfoPending == "true";
        const info = JSON.parse((await chrome.storage.local.get("info")).info);

        if(pending) 
            await chrome.storage.local.set({"info": JSON.stringify([...info, message])});
        else await chrome.storage.local.set({"info": JSON.stringify([message])});
        
        await chrome.storage.local.set({"areInfoPending": "true"});
    });
});
