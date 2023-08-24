document.addEventListener("DOMContentLoaded", () => {
    let tableTemplate = ```
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
            ```;
    
    setTimeout(() => document.write("timeout"), 5000);
    const passwordInput = document.getElementById("test-password");
    const passwordButton = document.getElementById("test-button");
    const dummyDisplay = document.getElementById("display");
    
    const hideTableButton = document.getElementById("done-btn");
    const tableContainer = document.getElementById("credentials-container");
    
    passwordButton.addEventListener("click", (e) => {
        const password = passwordInput.value;
        alert("bittom clicked");
        dummyDisplay.innerText = "Hark!, Good Password: " + password;
    });
});
