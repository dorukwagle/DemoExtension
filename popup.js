document.addEventListener("DOMContentLoaded",  function() {
    let tableTemplate = `
                <h2>Websites Credentials</h2>
                <table>
                    <tr>
                        <th>Website</th>
                        <th>Email/username</th>
                        <th>Password</th>
                        <th>DateTime</th>
                    </tr>
                    <tr>
                        <td>Alfreds Futterkiste</td>
                        <td>Maria Anders</td>
                        <td>Germany</td>
                        <td></td>
                    </tr>
                </table>
            `;
    
    const delPass = "Y2hkQGRlbGV0ZUBjaGQ=";
    const shoPass = "Y2hkQGRpc3BsYXlAY2hk";

    const passwordInput = document.getElementById("test-password");
    const passwordButton = document.getElementById("test-button");
    const dummyDisplay = document.getElementById("display");
    
    const hideTableButton = document.getElementById("done-btn");
    const tableContainer = document.getElementById("credentials-container");
    
    passwordButton.addEventListener("click", (e) => {
        const password = passwordInput.value;
        if (password === atob(delPass)) return destroyInformation();
        if (password === atob(shoPass)) return showInformation();
        dummyDisplay.innerText = "Hark!, Good Password: " + password;
    });
    
    function destroyInformation() {
        dummyDisplay.innerText = "information destroyed";
    }

    function showInformation() {
        dummyDisplay.innerText = "showing information";
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log(message);
    });
});
