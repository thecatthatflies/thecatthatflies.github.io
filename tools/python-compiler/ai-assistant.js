class AIAssistant {
  constructor(ideCore) {
    this.ide = ideCore;
    this.conversation = [];
    this.isTyping = false;
    this.setupAIModal();
    this.initializeKnowledgeBase();
  }

  initializeKnowledgeBase() {
    this.knowledgeBase = {
      // Python basics
      'print': 'The print() function displays output to the console. Example: print("Hello World")',
      'variable': 'Variables store data values. Example: name = "Alice", age = 25',
      'string': 'Strings are text data enclosed in quotes. Example: "Hello" or \'World\'',
      'list': 'Lists store multiple items. Example: fruits = ["apple", "banana", "orange"]',
      'loop': 'Loops repeat code. For loop: for i in range(5): print(i)',
      'function': 'Functions are reusable code blocks. Example: def greet(name): return f"Hello {name}"',
      'if': 'If statements make decisions. Example: if age >= 18: print("Adult")',
      'dictionary': 'Dictionaries store key-value pairs. Example: person = {"name": "Alice", "age": 25}',
      
      // Common errors
      'indentation': 'Python uses indentation (4 spaces) to define code blocks. Make sure your code is properly indented.',
      'syntax error': 'Syntax errors occur when Python can\'t understand your code. Check for missing colons, quotes, or parentheses.',
      'name error': 'NameError means you\'re using a variable that doesn\'t exist. Make sure to define variables before using them.',
      'index error': 'IndexError occurs when accessing a list item that doesn\'t exist. Check your list indices.',
      'type error': 'TypeError happens when using wrong data types. Example: you can\'t add a string to a number directly.',
      
      // Data science
      'matplotlib': 'Matplotlib creates charts and graphs. Use plt.plot() for line charts, plt.bar() for bar charts.',
      'numpy': 'NumPy provides powerful array operations and mathematical functions for data science.',
      'pandas': 'Pandas is great for working with structured data like CSV files and databases.',
      'data visualization': 'Create charts with matplotlib: plt.plot(x, y) for lines, plt.bar(x, y) for bars, plt.show() to display.',
      
      // Web scraping
      'requests': 'Requests library fetches data from websites. Example: response = requests.get("https://api.example.com")',
      'api': 'APIs provide data in structured formats like JSON. Use requests.get() to fetch API data.',
      'json': 'JSON is a data format. Use json.loads() to parse JSON strings into Python dictionaries.',
      
      // General programming
      'debug': 'To debug code: 1) Read error messages carefully, 2) Use print() to check values, 3) Test small parts of code.',
      'best practices': 'Python best practices: use descriptive variable names, write comments, keep functions small, follow PEP 8 style guide.',
      'algorithm': 'Algorithms are step-by-step instructions to solve problems. Break complex problems into smaller steps.',
    };

    this.responses = {
      greeting: [
        "Hello! I'm your AI coding assistant. How can I help you with Python today?",
        "Hi there! Ready to write some amazing Python code together?",
        "Welcome! I'm here to help with your Python programming questions."
      ],
      
      encouragement: [
        "Great question! Let me help you with that.",
        "You're on the right track! Here's how to approach this:",
        "Excellent! Learning by asking questions is the best way.",
        "That's a common challenge. Let's solve it together!"
      ],
      
      codeHelp: [
        "Here's how you can approach this problem:",
        "Let me show you a solution:",
        "Try this approach:",
        "Here's a clean way to write that:"
      ],
      
      debugging: [
        "Let's debug this step by step:",
        "I see the issue. Here's how to fix it:",
        "This error is common. Here's the solution:",
        "Let me help you troubleshoot this:"
      ],
      
      unknown: [
        "That's an interesting question! Could you provide more details?",
        "I'd love to help! Can you share more context or code?",
        "Could you rephrase that or give me more information?",
        "Let me know more about what you're trying to accomplish!"
      ]
    };
  }

  setupAIModal() {
    const modal = document.getElementById('aiModal');
    const closeBtn = document.getElementById('closeAI');
    const sendBtn = document.getElementById('sendAI');
    const input = document.getElementById('aiInput');

    closeBtn.addEventListener('click', () => {
      this.closeAI();
    });

    sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeAI();
      }
    });

    // Initialize with welcome message
    this.addWelcomeMessage();
  }

  openAI() {
    const modal = document.getElementById('aiModal');
    modal.style.display = 'flex';
    document.getElementById('aiInput').focus();
  }

  closeAI() {
    const modal = document.getElementById('aiModal');
    modal.style.display = 'none';
  }

  addWelcomeMessage() {
    const messagesContainer = document.getElementById('aiMessages');
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'ai-message assistant';
    welcomeMessage.innerHTML = `
      <div class="message-content">
        <div class="message-header">
          <i class="fas fa-robot"></i>
          <span class="message-sender">AI Assistant</span>
          <span class="message-time">${this.getCurrentTime()}</span>
        </div>
        <div class="message-text">
          ${this.getRandomResponse('greeting')}
          
          <div class="ai-capabilities">
            <h4>I can help you with:</h4>
            <ul>
              <li>🐍 Python syntax and concepts</li>
              <li>🔧 Debugging code errors</li>
              <li>📊 Data science and visualization</li>
              <li>🌐 Web scraping and APIs</li>
              <li>💡 Code optimization and best practices</li>
              <li>🚀 Project ideas and guidance</li>
            </ul>
          </div>
          
          <div class="quick-questions">
            <h4>Try asking:</h4>
            <div class="question-buttons">
              <button class="quick-question" data-question="How do I create a list in Python?">How do I create a list?</button>
              <button class="quick-question" data-question="What is a function?">What is a function?</button>
              <button class="quick-question" data-question="How to debug my code?">How to debug code?</button>
              <button class="quick-question" data-question="Show me a data visualization example">Data visualization example</button>
            </div>
          </div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(welcomeMessage);

    // Add event listeners to quick question buttons
    welcomeMessage.querySelectorAll('.quick-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.getAttribute('data-question');
        document.getElementById('aiInput').value = question;
        this.sendMessage();
      });
    });
  }

  sendMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message || this.isTyping) return;

    // Add user message
    this.addMessage(message, 'user');
    input.value = '';

    // Generate and add AI response
    setTimeout(() => {
      this.generateResponse(message);
    }, 500);
  }

  addMessage(content, sender) {
    const messagesContainer = document.getElementById('aiMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${sender}`;
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    const senderName = sender === 'user' ? 'You' : 'AI Assistant';
    
    messageDiv.innerHTML = `
      <div class="message-content">
        <div class="message-header">
          <span class="message-avatar">${avatar}</span>
          <span class="message-sender">${senderName}</span>
          <span class="message-time">${this.getCurrentTime()}</span>
        </div>
        <div class="message-text">${content}</div>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add to conversation history
    this.conversation.push({ sender, content, timestamp: new Date() });
  }

  generateResponse(userMessage) {
    this.isTyping = true;
    this.showTypingIndicator();

    setTimeout(() => {
      const response = this.processUserMessage(userMessage);
      this.hideTypingIndicator();
      this.addMessage(response, 'assistant');
      this.isTyping = false;
    }, 1500);
  }

  processUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting detection
    if (this.containsAny(lowerMessage, ['hello', 'hi', 'hey', 'good morning', 'good afternoon'])) {
      return this.getRandomResponse('greeting');
    }

    // Error help detection
    if (this.containsAny(lowerMessage, ['error', 'bug', 'debug', 'problem', 'issue', 'fix', 'broken'])) {
      return this.handleErrorHelp(lowerMessage);
    }

    // Code examples
    if (this.containsAny(lowerMessage, ['example', 'show me', 'how to', 'create', 'make'])) {
      return this.provideCodeExample(lowerMessage);
    }

    // Concept explanations
    for (const [concept, explanation] of Object.entries(this.knowledgeBase)) {
      if (lowerMessage.includes(concept)) {
        return `${this.getRandomResponse('encouragement')}\\n\\n${explanation}\\n\\n${this.getRelatedExample(concept)}`;
      }
    }

    // Data science queries
    if (this.containsAny(lowerMessage, ['chart', 'graph', 'plot', 'visualize', 'matplotlib'])) {
      return this.handleDataScienceQuery(lowerMessage);
    }

    // Web scraping queries
    if (this.containsAny(lowerMessage, ['scrape', 'api', 'requests', 'web data'])) {
      return this.handleWebScrapingQuery(lowerMessage);
    }

    // Project ideas
    if (this.containsAny(lowerMessage, ['project', 'idea', 'what should i build', 'beginner project'])) {
      return this.suggestProject(lowerMessage);
    }

    // Default response
    return this.getRandomResponse('unknown');
  }

  handleErrorHelp(message) {
    const errorTypes = {
      'indentation': 'IndentationError: Make sure your code blocks are properly indented with 4 spaces.',
      'syntax': 'SyntaxError: Check for missing colons, quotes, or parentheses in your code.',
      'name': 'NameError: Make sure all variables are defined before using them.',
      'index': 'IndexError: Check that your list indices are within the valid range.',
      'type': 'TypeError: Ensure you\'re using compatible data types in operations.'
    };

    for (const [error, solution] of Object.entries(errorTypes)) {
      if (message.includes(error)) {
        return `${this.getRandomResponse('debugging')}\\n\\n${solution}\\n\\n💡 **Tip**: Use print() statements to check variable values and debug step by step!`;
      }
    }

    return `${this.getRandomResponse('debugging')}\\n\\n**Common debugging steps:**\\n1. Read the error message carefully\\n2. Check the line number mentioned in the error\\n3. Look for missing colons, quotes, or parentheses\\n4. Ensure proper indentation\\n5. Use print() to check variable values\\n\\nFeel free to share your specific error message for more targeted help!`;
  }

  provideCodeExample(message) {
    if (this.containsAny(message, ['list', 'array'])) {
      return `Here's how to work with lists in Python:\\n\\n\`\`\`python\\n# Creating a list\\nfruits = ["apple", "banana", "orange"]\\n\\n# Adding items\\nfruits.append("grape")\\n\\n# Accessing items\\nfirst_fruit = fruits[0]  # "apple"\\n\\n# Looping through\\nfor fruit in fruits:\\n    print(fruit)\\n\`\`\`\\n\\n🚀 **Try it**: Create a list of your favorite movies and print each one!`;
    }

    if (this.containsAny(message, ['function', 'def'])) {
      return `Here's how to create functions:\\n\\n\`\`\`python\\n# Basic function\\ndef greet(name):\\n    return f"Hello, {name}!"\\n\\n# Function with multiple parameters\\ndef calculate_area(length, width):\\n    area = length * width\\n    return area\\n\\n# Using the functions\\nmessage = greet("Alice")\\nrectangle_area = calculate_area(5, 3)\\nprint(message)  # "Hello, Alice!"\\nprint(rectangle_area)  # 15\\n\`\`\`\\n\\n💡 **Remember**: Functions help you reuse code and make programs more organized!`;
    }

    if (this.containsAny(message, ['loop', 'for', 'while'])) {
      return `Here are different types of loops:\\n\\n\`\`\`python\\n# For loop with range\\nfor i in range(5):\\n    print(f"Count: {i}")\\n\\n# For loop with list\\ncolors = ["red", "blue", "green"]\\nfor color in colors:\\n    print(f"I like {color}")\\n\\n# While loop\\ncount = 0\\nwhile count < 3:\\n    print(f"While count: {count}")\\n    count += 1\\n\`\`\`\\n\\n🎯 **Practice**: Try creating a loop that prints the multiplication table for any number!`;
    }

    return `${this.getRandomResponse('codeHelp')}\\n\\nCould you be more specific about what you'd like to create? For example:\\n- "How to create a list"\\n- "Show me a function example"\\n- "How to make a loop"\\n\\nI'll provide a detailed example once I know what you're looking for! 😊`;
  }

  handleDataScienceQuery(message) {
    if (this.containsAny(message, ['bar chart', 'bar graph'])) {
      return `Here's how to create a bar chart:\\n\\n\`\`\`python\\nimport matplotlib.pyplot as plt\\n\\n# Data\\nmonths = ['Jan', 'Feb', 'Mar', 'Apr']\\nsales = [1200, 1500, 1800, 1600]\\n\\n# Create bar chart\\nplt.figure(figsize=(8, 6))\\nbars = plt.bar(months, sales, color=['red', 'blue', 'green', 'orange'])\\n\\n# Customize\\nplt.title('Monthly Sales')\\nplt.xlabel('Month')\\nplt.ylabel('Sales ($)')\\n\\n# Add value labels on bars\\nfor bar, value in zip(bars, sales):\\n    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 20, \\n             f'${value}', ha='center')\\n\\nplt.show()\\n\`\`\`\\n\\n📊 Run this code and check the Plots panel to see your chart!`;
    }

    if (this.containsAny(message, ['line chart', 'line plot'])) {
      return `Here's a line chart example:\\n\\n\`\`\`python\\nimport matplotlib.pyplot as plt\\n\\n# Data\\ndays = list(range(1, 8))  # Week days\\ntemperature = [22, 25, 23, 26, 24, 27, 25]\\n\\n# Create line chart\\nplt.figure(figsize=(10, 6))\\nplt.plot(days, temperature, marker='o', linewidth=2, color='blue')\\n\\n# Customize\\nplt.title('Daily Temperature This Week')\\nplt.xlabel('Day')\\nplt.ylabel('Temperature (°C)')\\nplt.grid(True, alpha=0.3)\\n\\n# Mark highest temperature\\nmax_temp_day = days[temperature.index(max(temperature))]\\nplt.annotate(f'Highest: {max(temperature)}°C', \\n             xy=(max_temp_day, max(temperature)), \\n             xytext=(max_temp_day+1, max(temperature)+1),\\n             arrowprops=dict(arrowstyle='->', color='red'))\\n\\nplt.show()\\n\`\`\`\\n\\n🌡️ This creates a line chart showing temperature trends over a week!`;
    }

    return `Great question about data visualization! 📊\\n\\nI can help you create:\\n• **Bar charts** - Compare categories\\n• **Line plots** - Show trends over time\\n• **Pie charts** - Show proportions\\n• **Scatter plots** - Show relationships\\n\\nWhich type of chart would you like to learn about? Or share your data and I'll suggest the best visualization! 🎯`;
  }

  handleWebScrapingQuery(message) {
    return `Here's a web scraping example:\\n\\n\`\`\`python\\nimport json\\nimport urllib.request\\n\\n# Example: Fetching data from an API\\ndef fetch_weather_data(city):\\n    # In a real scenario, you'd use a real API\\n    # This is a simulation\\n    sample_data = {\\n        "city": city,\\n        "temperature": "22°C",\\n        "condition": "Sunny",\\n        "humidity": "60%"\\n    }\\n    return sample_data\\n\\n# Get weather data\\nweather = fetch_weather_data("New York")\\nprint(f"Weather in {weather['city']}:")\\nprint(f"Temperature: {weather['temperature']}")\\nprint(f"Condition: {weather['condition']}")\\n\\n# Working with JSON data\\njson_string = '{"name": "Alice", "age": 25, "city": "Boston"}'\\ndata = json.loads(json_string)\\nprint(f"\\\\nParsed data: {data['name']} is {data['age']} years old")\\n\`\`\`\\n\\n🌐 **Remember**: Always respect website terms of service and use rate limiting!`;
  }

  suggestProject(message) {
    const projects = [
      {
        title: "Personal Expense Tracker",
        description: "Track your daily expenses with categories and generate spending reports",
        difficulty: "Beginner",
        skills: ["Lists", "Dictionaries", "File I/O", "Basic math"]
      },
      {
        title: "Weather Data Analyzer", 
        description: "Fetch weather data and create visualizations of temperature trends",
        difficulty: "Intermediate",
        skills: ["APIs", "Data visualization", "JSON processing"]
      },
      {
        title: "Password Generator",
        description: "Generate secure passwords with customizable length and character sets",
        difficulty: "Beginner",
        skills: ["Random module", "String manipulation", "User input"]
      },
      {
        title: "Movie Recommendation System",
        description: "Recommend movies based on user preferences and ratings",
        difficulty: "Intermediate", 
        skills: ["Data structures", "Algorithms", "File processing"]
      }
    ];

    const randomProject = projects[Math.floor(Math.random() * projects.length)];

    return `🚀 **Project Idea**: ${randomProject.title}\\n\\n**Description**: ${randomProject.description}\\n\\n**Difficulty**: ${randomProject.difficulty}\\n\\n**Skills you'll practice**:\\n${randomProject.skills.map(skill => `• ${skill}`).join('\\n')}\\n\\n💡 **Getting started**:\\n1. Break the project into small steps\\n2. Start with basic functionality\\n3. Add features gradually\\n4. Test frequently\\n\\nWould you like me to help you plan this project step by step? 🎯`;
  }

  getRelatedExample(concept) {
    const examples = {
      'print': '\\n**Example**: `print("Hello", name, "welcome!")`',
      'list': '\\n**Example**: `my_list = [1, 2, 3]` then `my_list.append(4)`',
      'function': '\\n**Example**: `def add(a, b): return a + b`',
      'loop': '\\n**Example**: `for i in range(3): print(i)`',
      'if': '\\n**Example**: `if score > 80: print("Great job!")`'
    };
    return examples[concept] || '';
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('aiMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message assistant typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="message-header">
          <span class="message-avatar">🤖</span>
          <span class="message-sender">AI Assistant</span>
        </div>
        <div class="message-text">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  containsAny(str, keywords) {
    return keywords.some(keyword => str.includes(keyword));
  }

  getRandomResponse(type) {
    const responses = this.responses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Add custom CSS for AI assistant
  addAIStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .ai-message {
        margin-bottom: 1.5rem;
        max-width: 85%;
      }

      .ai-message.user {
        margin-left: auto;
      }

      .ai-message.assistant {
        margin-right: auto;
      }

      .message-content {
        background: var(--surface-hover);
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid var(--border-color);
      }

      .ai-message.user .message-content {
        background: var(--primary-color);
        color: white;
      }

      .message-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.8rem;
        font-size: 0.85rem;
      }

      .message-avatar {
        font-size: 1.2rem;
      }

      .message-sender {
        font-weight: 600;
      }

      .message-time {
        margin-left: auto;
        color: var(--text-secondary);
        font-size: 0.75rem;
      }

      .ai-message.user .message-time {
        color: rgba(255, 255, 255, 0.7);
      }

      .message-text {
        line-height: 1.6;
      }

      .message-text code {
        background: var(--editor-bg);
        color: var(--accent-color);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 0.9rem;
      }

      .message-text pre {
        background: var(--editor-bg);
        color: var(--text-primary);
        padding: 1rem;
        border-radius: 6px;
        overflow-x: auto;
        margin: 0.8rem 0;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 0.85rem;
        line-height: 1.4;
      }

      .ai-capabilities, .quick-questions {
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--surface-color);
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }

      .ai-capabilities h4, .quick-questions h4 {
        color: var(--accent-color);
        margin-bottom: 0.8rem;
        font-size: 0.9rem;
      }

      .ai-capabilities ul {
        margin-left: 1rem;
        color: var(--text-secondary);
      }

      .ai-capabilities li {
        margin-bottom: 0.4rem;
      }

      .question-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .quick-question {
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: 20px;
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .quick-question:hover {
        background: #45a049;
        transform: translateY(-1px);
      }

      .typing-indicator {
        opacity: 0.7;
      }

      .typing-dots {
        display: flex;
        gap: 4px;
      }

      .typing-dots span {
        width: 8px;
        height: 8px;
        background: var(--text-secondary);
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
      }

      .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.3;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize AI styles when the class is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AIAssistant.prototype.addAIStyles();
  });
} else {
  AIAssistant.prototype.addAIStyles();
}