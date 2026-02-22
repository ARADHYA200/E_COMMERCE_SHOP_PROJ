const testRenderAPI = async () => {
  console.log("Checking Render deployed API...");
  try {
    const response = await fetch("https://e-commerce-shop-proj.onrender.com/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Test Render Deploy",
        email: `render_test_${Date.now()}@yopmail.com`,
        password: "password123",
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        console.log("Response OK (201/200): It succeeded.");
        console.log("Returned data:", data);
        console.log("Note: If it succeeded but no email was sent, Render is still running the old code.");
    } else {
        console.error("Response FAILED with status:", response.status);
        console.error("Returned data:", data);
        console.log("Note: If status is 500, Render has the new code but is missing EMAIL_USER/PASS env variables.");
    }
  } catch (error) {
     console.error("Fetch failed:", error.message);
  }
};

testRenderAPI();
