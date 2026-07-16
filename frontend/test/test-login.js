const LOGIN_URL = 'http://127.0.0.1:8000/api/auth/login/';

const testLogin = async (credentials) => {
    console.log(`\n--- Attempting to log in: ${credentials.email} ---`);

    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("LOGIN FAILED");
            // SimpleJWT returns its error message under the detail key
            console.error("Error:", data.detail || "Invalid credentials.");
            return;
        }

        console.log("LOGIN SUCCESSFUL");
        console.log("Access Token (Valid for 15 mins):");
        console.log(data.access);
        console.log("\nRefresh Token (Valid for 7 days):");
        console.log(data.refresh);

    } catch (error) {
        console.error("🚨 CRITICAL NETWORK ERROR");
        console.error("Could not reach the Django server. Is it running?");
        console.error("Error Details:", error.message);
    }
};

const runTests = async () => {
    // Test 1 - Successful login (Correct email and password)
    await testLogin({
        email: "accessible_test@abdn.ac.uk",
        password: "StrongPassword123!"
    });

    // Test 2 - Wrong Password
    await testLogin({
        email: "accessible_test@abdn.ac.uk",
        password: "WrongPassword!!!"
    });
};

runTests();