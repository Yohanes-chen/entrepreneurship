const topicInput = document.getElementById('topicInput');
const pathContainer = document.getElementById('pathContainer');
const loadingIndicator = document.getElementById('loading');

// 🔴 PASTE YOUR KEY HERE (Keep the quotes!)
const API_KEY = "AIzaSyAi0N630qDOFRYLPF8c0UFXDk74WaTTg1g"; 

async function generatePath() {
    const topic = topicInput.value.trim();
    if (!topic) return alert("Please enter a topic!");

    pathContainer.innerHTML = '';
    loadingIndicator.classList.remove('hidden');

    try {
        const steps = await fetchGeminiPath(topic);
        renderPath(steps);
    } catch (error) {
        console.error("Error details:", error);
        alert(`Failed: ${error.message}. Check console for details.`);
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

async function fetchGeminiPath(topic) {
    // ✅ THIS IS THE FIX:
    // 1. Use 'gemini-1.5-flash' (It is the best free model right now)
    // 2. Ensure no spaces in the URL
// Switching to the newer 2.0 model which is widely available on the free tier
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;    console.log("Attempting to connect to:", url); // Check your console to see if this looks right

    const prompt = `
        You are an expert teacher. Create a 6-Month learning path for a beginner wanting to learn: "${topic}".

        Each object must have exactly two properties: "title" and "description".
        
        Example format:
        [
            {"title": "Month 1", "description": "Do this..."},
            {"title": "Month 2", "description": "Then this..."}
        ]
        
        
    `;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) {
        // If this prints 404, the URL above is wrong or the Key is invalid
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Safety check: Did Gemini actually reply?
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("Gemini returned no results.");
    }

    let text = data.candidates[0].content.parts[0].text;
    
    // Clean up markdown just in case
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text);
}

function renderPath(steps) {
    steps.forEach((step, index) => {
        const card = document.createElement('div');
        card.classList.add('step-card');
        card.style.animationDelay = `${index * 0.2}s`;
        card.innerHTML = `
            <span class="step-badge">Step ${index + 1}</span>
            <div class="step-title">${step.title}</div>
            <div class="step-desc">${step.description}</div>
        `;
        pathContainer.appendChild(card);
    });
}

async function generatePath() {
    const topic = topicInput.value.trim();
    const btn = document.querySelector('button'); // Get the button

    if (!topic) return alert("Please enter a topic!");

    // 1. DISABLE BUTTON & Show Loading
    btn.disabled = true;
    btn.innerText = "Generating...";
    pathContainer.innerHTML = '';
    loadingIndicator.classList.remove('hidden');

    try {
        const steps = await fetchGeminiPath(topic);
        renderPath(steps);
    } catch (error) {
        console.error(error);
        if (error.message.includes("429")) {
             alert("You are going too fast! Please wait 1 minute and try again.");
        } else {
             alert(`Error: ${error.message}`);
        }
    } finally {
        // 2. RE-ENABLE BUTTON
        loadingIndicator.classList.add('hidden');
        btn.disabled = false;
        btn.innerText = "Generate Path";
    }
}