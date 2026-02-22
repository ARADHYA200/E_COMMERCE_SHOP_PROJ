const testRegister = async () => {
  console.log("Starting full registration test via API...");
  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Test User API Native",
        email: "native_tester_another@yopmail.com", // Random unique email
        password: "password123",
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        console.log("Registration successful response:");
        console.log(data);
    } else {
        console.error("Registration failed with status:", response.status);
        console.error("Data:", data);
    }
  } catch (error) {
     console.error("Registration failed completely:", error.message);
  }
};

testRegister();
