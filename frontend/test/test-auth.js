// test-auth.js

const API_URL = 'http://127.0.0.1:8000/api/auth/register/';

const testRegistration = async (userData) => {
    console.log(`\n--- Attempting to register: ${userData.email} ---`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        // Parse the JSON response from Django
        const data = await response.json();

        // Test 1: Server rejected the data (e.g., email taken, weak password)
        if (!response.ok) {
            console.error("REGISTRATION FAILED");
            console.error(`Accessible Message: "${data.message}"`);
            console.error("Raw Field Errors:", data.field_errors);
            return;
        }

        // Test 2: User is created
        console.log("REGISTRATION SUCCESSFUL");
        console.log(`Message: ${data.message}`);
        console.log("User Profile Data Saved:", data.user);

    } catch (error) {
        // Test 3: Testing down network, down server, or blocked CORS
        console.error("CRITICAL NETWORK ERROR");
        console.error("Could not reach the Django server. Is it running?");
        console.error("Error Details:", error.message);
    }
};

const runTests = async () => {
    // Test 4: Success test
    await testRegistration({
        email: "accessible_test@abdn.ac.uk",
        password: "StrongPassword123!",
        first_name: "Accessible",
        last_name: "User"
    });

    // Test 5: Duplicate Email test (Should trigger the accessible error)
    await testRegistration({
        email: "accessible_test@abdn.ac.uk",
        password: "AnotherPassword123!",
        first_name: "Duplicate",
        last_name: "Tester"
    });

    // Test 6: Missing Required Field test (Password)
    await testRegistration({
        email: "missing_password@abdn.ac.uk",
        password: "", // Intentionally blank
        first_name: "Oops",
        last_name: "NoPass"
    });
};

runTests();