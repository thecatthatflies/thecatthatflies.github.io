class TutorialSystem {
  constructor(ideCore) {
    this.ide = ideCore;
    this.currentTutorial = null;
    this.currentLesson = 0;
    this.tutorials = this.initializeTutorials();
    this.setupTutorialModal();
  }

  initializeTutorials() {
    return {
      'python-basics': {
        title: 'Python Basics',
        description: 'Learn Python fundamentals step by step',
        icon: 'fab fa-python',
        difficulty: 'Beginner',
        lessons: [
          {
            title: 'Hello World',
            description: 'Your first Python program',
            code: `# Welcome to Python!
# Let's start with the classic "Hello World" program

print("Hello, World!")
print("Welcome to Python programming!")

# Try modifying the text and run the code
print("This is my first Python program!")`,
            instructions: `
<h3>🎉 Welcome to Python Programming!</h3>
<p>Let's start with the most basic Python program - printing text to the console.</p>

<h4>What you'll learn:</h4>
<ul>
  <li>How to use the <code>print()</code> function</li>
  <li>Working with strings in Python</li>
  <li>Writing comments with <code>#</code></li>
</ul>

<h4>Try this:</h4>
<ol>
  <li>Click "Run Code" to execute the program</li>
  <li>Modify the text inside the quotes</li>
  <li>Add your own print statement</li>
  <li>Run the code again to see your changes</li>
</ol>

<div class="tutorial-tip">
  <strong>💡 Tip:</strong> In Python, anything after a <code>#</code> symbol is a comment and won't be executed.
</div>
            `,
            tasks: [
              'Run the provided code',
              'Change "Hello, World!" to your name',
              'Add a new print statement with your favorite color'
            ]
          },
          {
            title: 'Variables and Data Types',
            description: 'Learn about storing and using data',
            code: `# Variables in Python
name = "Alice"
age = 25
height = 5.6
is_student = True

# Print variables
print("Name:", name)
print("Age:", age)
print("Height:", height, "feet")
print("Is student:", is_student)

# Variable types
print("\\nData types:")
print(type(name))    # str (string)
print(type(age))     # int (integer)
print(type(height))  # float (decimal)
print(type(is_student))  # bool (boolean)

# Try creating your own variables
your_name = "Your Name Here"
your_age = 20
print(f"\\nHello, I'm {your_name} and I'm {your_age} years old!")`,
            instructions: `
<h3>📦 Variables and Data Types</h3>
<p>Variables are containers that store data values. Python has several built-in data types.</p>

<h4>Basic Data Types:</h4>
<ul>
  <li><strong>str</strong> - Text (strings): <code>"Hello"</code></li>
  <li><strong>int</strong> - Whole numbers: <code>42</code></li>
  <li><strong>float</strong> - Decimal numbers: <code>3.14</code></li>
  <li><strong>bool</strong> - True/False values: <code>True</code></li>
</ul>

<h4>F-strings (Formatted Strings):</h4>
<p>Use <code>f"text {variable}"</code> to easily insert variables into strings.</p>

<h4>Your turn:</h4>
<ol>
  <li>Change the values of the existing variables</li>
  <li>Create variables for your favorite movie and year</li>
  <li>Use an f-string to print them together</li>
</ol>

<div class="tutorial-tip">
  <strong>💡 Tip:</strong> Variable names should be descriptive and use lowercase with underscores.
</div>
            `,
            tasks: [
              'Modify the existing variables with your information',
              'Create a variable for your favorite movie',
              'Print your movie using an f-string'
            ]
          },
          {
            title: 'Lists and Loops',
            description: 'Working with collections of data',
            code: `# Lists in Python
fruits = ["apple", "banana", "orange", "grape"]
numbers = [1, 2, 3, 4, 5]

print("My fruits:")
print(fruits)

# Accessing list items (indexing starts at 0)
print("\\nFirst fruit:", fruits[0])
print("Last fruit:", fruits[-1])

# Adding items to a list
fruits.append("strawberry")
print("\\nAfter adding strawberry:", fruits)

# Looping through a list
print("\\nAll fruits:")
for fruit in fruits:
    print(f"- {fruit}")

# Looping with numbers
print("\\nCounting:")
for i in range(1, 6):
    print(f"Count: {i}")

# List comprehension (advanced)
squared_numbers = [x**2 for x in numbers]
print(f"\\nSquared numbers: {squared_numbers}")`,
            instructions: `
<h3>📋 Lists and Loops</h3>
<p>Lists store multiple items in a single variable. Loops let you repeat code for each item.</p>

<h4>List Basics:</h4>
<ul>
  <li><strong>Creating:</strong> <code>my_list = [1, 2, 3]</code></li>
  <li><strong>Accessing:</strong> <code>my_list[0]</code> (first item)</li>
  <li><strong>Adding:</strong> <code>my_list.append("new item")</code></li>
</ul>

<h4>For Loops:</h4>
<ul>
  <li><strong>Through list:</strong> <code>for item in my_list:</code></li>
  <li><strong>With range:</strong> <code>for i in range(5):</code></li>
</ul>

<h4>Practice:</h4>
<ol>
  <li>Add your favorite fruits to the list</li>
  <li>Create a list of your hobbies</li>
  <li>Use a loop to print each hobby with a number</li>
</ol>

<div class="tutorial-tip">
  <strong>💡 Tip:</strong> Python lists can contain different data types in the same list!
</div>
            `,
            tasks: [
              'Add two more fruits to the list',
              'Create a list of your hobbies',
              'Print each hobby with a number using a loop'
            ]
          },
          {
            title: 'Functions',
            description: 'Creating reusable code blocks',
            code: `# Functions in Python
def greet(name):
    """Function to greet someone"""
    return f"Hello, {name}! Nice to meet you!"

def calculate_area(length, width):
    """Calculate rectangle area"""
    area = length * width
    return area

def get_grade(score):
    """Determine grade based on score"""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"

# Using functions
print(greet("Alice"))
print(greet("Bob"))

rectangle_area = calculate_area(5, 3)
print(f"\\nRectangle area: {rectangle_area}")

# Testing grades
scores = [95, 87, 76, 65, 45]
print("\\nGrades:")
for score in scores:
    grade = get_grade(score)
    print(f"Score {score}: Grade {grade}")

# Your turn - create a function
def favorite_color(color):
    return f"My favorite color is {color}!"

print("\\n" + favorite_color("blue"))`,
            instructions: `
<h3>⚙️ Functions</h3>
<p>Functions are reusable blocks of code that perform specific tasks.</p>

<h4>Function Structure:</h4>
<pre><code>def function_name(parameters):
    """Documentation string"""
    # code here
    return result</code></pre>

<h4>Key Concepts:</h4>
<ul>
  <li><strong>Parameters:</strong> Values passed to the function</li>
  <li><strong>Return:</strong> Value sent back from the function</li>
  <li><strong>Docstring:</strong> Description of what the function does</li>
</ul>

<h4>Challenge:</h4>
<ol>
  <li>Create a function that calculates circle area (π × r²)</li>
  <li>Create a function that converts Celsius to Fahrenheit</li>
  <li>Test your functions with different values</li>
</ol>

<div class="tutorial-tip">
  <strong>💡 Tip:</strong> Good function names describe what the function does!
</div>
            `,
            tasks: [
              'Create a function to calculate circle area',
              'Create a function to convert Celsius to Fahrenheit',
              'Test both functions with different values'
            ]
          }
        ]
      },
      'data-science': {
        title: 'Data Science with Python',
        description: 'Explore data analysis and visualization',
        icon: 'fas fa-chart-bar',
        difficulty: 'Intermediate',
        lessons: [
          {
            title: 'Working with Data',
            description: 'Introduction to data manipulation',
            code: `# Data Science Basics
import math
import random

# Generate sample data
print("🔬 Data Science Tutorial - Working with Data")
print("=" * 50)

# Sample dataset: Student scores
students = [
    {"name": "Alice", "math": 85, "science": 92, "english": 78},
    {"name": "Bob", "math": 78, "science": 85, "english": 82},
    {"name": "Charlie", "math": 92, "science": 88, "english": 90},
    {"name": "Diana", "math": 88, "science": 95, "english": 86},
    {"name": "Eve", "math": 76, "science": 80, "english": 84}
]

# Basic statistics
math_scores = [student["math"] for student in students]
science_scores = [student["science"] for student in students]
english_scores = [student["english"] for student in students]

def calculate_stats(scores):
    """Calculate basic statistics"""
    mean = sum(scores) / len(scores)
    sorted_scores = sorted(scores)
    median = sorted_scores[len(scores) // 2]
    min_score = min(scores)
    max_score = max(scores)
    
    return {
        "mean": round(mean, 2),
        "median": median,
        "min": min_score,
        "max": max_score,
        "range": max_score - min_score
    }

# Analyze each subject
subjects = {"Math": math_scores, "Science": science_scores, "English": english_scores}

for subject, scores in subjects.items():
    stats = calculate_stats(scores)
    print(f"\\n{subject} Statistics:")
    print(f"  Mean: {stats['mean']}")
    print(f"  Median: {stats['median']}")
    print(f"  Range: {stats['min']} - {stats['max']} (span: {stats['range']})")

# Find top performers
print("\\n🏆 Top Performers:")
for student in students:
    avg_score = (student["math"] + student["science"] + student["english"]) / 3
    student["average"] = round(avg_score, 2)
    
# Sort by average score
students_sorted = sorted(students, key=lambda x: x["average"], reverse=True)

for i, student in enumerate(students_sorted, 1):
    print(f"{i}. {student['name']}: {student['average']} average")`,
            instructions: `
<h3>🔬 Introduction to Data Science</h3>
<p>Data Science involves collecting, analyzing, and interpreting data to find insights.</p>

<h4>What you'll learn:</h4>
<ul>
  <li>Working with structured data (dictionaries and lists)</li>
  <li>Calculating basic statistics (mean, median, range)</li>
  <li>List comprehensions for data transformation</li>
  <li>Sorting and ranking data</li>
</ul>

<h4>Key Concepts:</h4>
<ul>
  <li><strong>Mean:</strong> Average value</li>
  <li><strong>Median:</strong> Middle value when sorted</li>
  <li><strong>Range:</strong> Difference between highest and lowest</li>
</ul>

<h4>Try this:</h4>
<ol>
  <li>Add more students to the dataset</li>
  <li>Calculate statistics for overall averages</li>
  <li>Find students who excel in specific subjects</li>
</ol>

<div class="tutorial-tip">
  <strong>💡 Tip:</strong> List comprehensions like <code>[x for x in list]</code> are powerful for data transformation!
</div>
            `,
            tasks: [
              'Add 2 more students to the dataset',
              'Calculate the overall class average',
              'Find the student with the highest science score'
            ]
          },
          {
            title: 'Data Visualization',
            description: 'Creating charts and graphs',
            code: `# Data Visualization with Matplotlib
import matplotlib.pyplot as plt
import math

print("📊 Data Visualization Tutorial")
print("=" * 40)

# Sample data: Monthly sales
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
sales = [15000, 18000, 22000, 19000, 25000, 28000]
expenses = [12000, 14000, 16000, 15000, 18000, 20000]

# Create a line chart
plt.figure(figsize=(10, 6))

# Plot sales and expenses
plt.plot(months, sales, marker='o', linewidth=2, label='Sales', color='#2E8B57')
plt.plot(months, expenses, marker='s', linewidth=2, label='Expenses', color='#DC143C')

# Customize the chart
plt.title('Monthly Sales vs Expenses', fontsize=16, fontweight='bold')
plt.xlabel('Month', fontsize=12)
plt.ylabel('Amount ($)', fontsize=12)
plt.legend()
plt.grid(True, alpha=0.3)

# Add value labels on points
for i, (sale, expense) in enumerate(zip(sales, expenses)):
    plt.annotate(f'${sale:,}', (i, sale), textcoords="offset points", xytext=(0,10), ha='center')
    plt.annotate(f'${expense:,}', (i, expense), textcoords="offset points", xytext=(0,-15), ha='center')

# Show the plot
plt.tight_layout()
plt.show()

# Calculate profit
profit = [s - e for s, e in zip(sales, expenses)]
print("\\n💰 Monthly Profit Analysis:")
for month, p in zip(months, profit):
    status = "📈" if p > 0 else "📉"
    print(f"{month}: ${p:,} {status}")

total_profit = sum(profit)
print(f"\\nTotal 6-month profit: ${total_profit:,}")

# Create a bar chart for profit
plt.figure(figsize=(10, 5))
colors = ['green' if p > 0 else 'red' for p in profit]
bars = plt.bar(months, profit, color=colors, alpha=0.7)

plt.title('Monthly Profit', fontsize=16, fontweight='bold')
plt.xlabel('Month')
plt.ylabel('Profit ($)')
plt.axhline(y=0, color='black', linestyle='-', alpha=0.3)

# Add value labels on bars
for bar, p in zip(bars, profit):
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height + (100 if height > 0 else -200),
             f'${p:,}', ha='center', va='bottom' if height > 0 else 'top')

plt.tight_layout()
plt.show()

print("\\n🎯 Charts created successfully!")
print("Check the 'Plots' tab to see your visualizations!")`,
            instructions: `
<h3>📊 Data Visualization</h3>
<p>Charts and graphs make data easier to understand and find patterns.</p>

<h4>Matplotlib Basics:</h4>
<ul>
  <li><strong>Line plots:</strong> Great for trends over time</li>
  <li><strong>Bar charts:</strong> Compare categories or values</li>
  <li><strong>Customization:</strong> Colors, labels, legends, and annotations</li>
</ul>

<h4>Chart Elements:</h4>
<ul>
  <li><strong>Title:</strong> Describes what the chart shows</li>
  <li><strong>Axes labels:</strong> Explain what X and Y represent</li>
  <li><strong>Legend:</strong> Identifies different data series</li>
  <li><strong>Grid:</strong> Makes values easier to read</li>
</ul>

<h4>Your challenge:</h4>
<ol>
  <li>Modify the sales data with your own numbers</li>
  <li>Add more months to the dataset</li>
  <li>Create a pie chart showing expense categories</li>
</ol>

<div class="tutorial-tip">
  <strong>💡 Tip:</strong> After running the code, check the "Plots" panel to see your visualizations!
</div>
            `,
            tasks: [
              'Modify the sales and expense data',
              'Add 3 more months of data',
              'Create a pie chart for different expense categories'
            ]
          }
        ]
      },
      'web-scraping': {
        title: 'Web Scraping',
        description: 'Extract data from websites',
        icon: 'fas fa-spider',
        difficulty: 'Intermediate',
        lessons: [
          {
            title: 'HTTP Requests',
            description: 'Fetching data from web APIs',
            code: `# Web Scraping Tutorial - HTTP Requests
import json
import urllib.request
import urllib.parse

print("🌐 Web Scraping Tutorial - HTTP Requests")
print("=" * 45)

# Example 1: Fetch data from a JSON API (simulated)
def simulate_api_response():
    """Simulate a weather API response"""
    return {
        "weather": {
            "city": "New York",
            "temperature": 22,
            "humidity": 65,
            "condition": "Partly Cloudy",
            "wind_speed": 12
        },
        "forecast": [
            {"day": "Today", "high": 24, "low": 18, "condition": "Sunny"},
            {"day": "Tomorrow", "high": 26, "low": 20, "condition": "Cloudy"},
            {"day": "Day 3", "high": 23, "low": 17, "condition": "Rainy"}
        ]
    }

# Simulate fetching weather data
print("📡 Fetching weather data...")
weather_data = simulate_api_response()

# Parse and display current weather
current = weather_data["weather"]
print(f"\\n🌤️  Current Weather in {current['city']}:")
print(f"   Temperature: {current['temperature']}°C")
print(f"   Condition: {current['condition']}")
print(f"   Humidity: {current['humidity']}%")
print(f"   Wind Speed: {current['wind_speed']} km/h")

# Display forecast
print("\\n📅 3-Day Forecast:")
for day_data in weather_data["forecast"]:
    print(f"   {day_data['day']}: {day_data['high']}°/{day_data['low']}° - {day_data['condition']}")

# Example 2: Working with URL parameters
def build_api_url(base_url, params):
    """Build URL with query parameters"""
    query_string = urllib.parse.urlencode(params)
    return f"{base_url}?{query_string}"

# Example API parameters
api_params = {
    "city": "London",
    "units": "metric",
    "lang": "en"
}

api_url = build_api_url("https://api.weather.com/v1/current", api_params)
print(f"\\n🔗 Generated API URL:")
print(f"   {api_url}")

# Example 3: Handling different response formats
sample_responses = {
    "json": '{"status": "success", "data": [1, 2, 3, 4, 5]}',
    "csv": "name,age,city\\nAlice,25,New York\\nBob,30,London",
    "xml": "<users><user><name>Charlie</name><age>35</age></user></users>"
}

print("\\n📋 Processing Different Data Formats:")

# JSON processing
json_data = json.loads(sample_responses["json"])
print(f"JSON data: {json_data['data']}")

# CSV processing (simple)
csv_lines = sample_responses["csv"].split("\\n")
headers = csv_lines[0].split(",")
rows = [line.split(",") for line in csv_lines[1:]]
print(f"CSV headers: {headers}")
print(f"CSV rows: {rows}")

# Simple XML parsing (basic)
xml_content = sample_responses["xml"]
if "<name>" in xml_content:
    name_start = xml_content.find("<name>") + 6
    name_end = xml_content.find("</name>")
    name = xml_content[name_start:name_end]
    print(f"Extracted name from XML: {name}")

print("\\n✅ HTTP requests tutorial completed!")`,
            instructions: `
<h3>🌐 HTTP Requests and APIs</h3>
<p>Learn how to fetch data from websites and web APIs using Python.</p>

<h4>Key Concepts:</h4>
<ul>
  <li><strong>APIs:</strong> Application Programming Interfaces for data access</li>
  <li><strong>HTTP Requests:</strong> How to ask for data from servers</li>
  <li><strong>JSON:</strong> JavaScript Object Notation - common data format</li>
  <li><strong>URL Parameters:</strong> Adding filters and options to requests</li>
</ul>

<h4>Common Data Formats:</h4>
<ul>
  <li><strong>JSON:</strong> Structured data, easy to work with</li>
  <li><strong>CSV:</strong> Comma-separated values, good for spreadsheet data</li>
  <li><strong>XML:</strong> Markup language, more complex structure</li>
</ul>

<h4>Practice:</h4>
<ol>
  <li>Modify the weather data with different cities</li>
  <li>Add more fields to the API parameters</li>
  <li>Create a function to parse CSV data into dictionaries</li>
</ol>

<div class="tutorial-tip">
  <strong>💡 Tip:</strong> Always check API documentation for rate limits and required parameters!
</div>
            `,
            tasks: [
              'Add more cities to the weather simulation',
              'Create a function to format temperature displays',
              'Parse the CSV data into a list of dictionaries'
            ]
          }
        ]
      }
    };
  }

  setupTutorialModal() {
    const modal = document.getElementById('tutorialModal');
    const closeBtn = document.getElementById('closeTutorial');
    const prevBtn = document.getElementById('prevLesson');
    const nextBtn = document.getElementById('nextLesson');

    closeBtn.addEventListener('click', () => {
      this.closeTutorial();
    });

    prevBtn.addEventListener('click', () => {
      this.previousLesson();
    });

    nextBtn.addEventListener('click', () => {
      this.nextLesson();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeTutorial();
      }
    });
  }

  openTutorial() {
    const modal = document.getElementById('tutorialModal');
    const categoriesContainer = document.getElementById('tutorialCategories');

    // Clear existing content
    categoriesContainer.innerHTML = '';

    // Populate tutorial categories
    Object.entries(this.tutorials).forEach(([key, tutorial]) => {
      const categoryItem = document.createElement('div');
      categoryItem.className = 'tutorial-category';
      categoryItem.innerHTML = `
        <div class="tutorial-card" data-tutorial="${key}">
          <div class="tutorial-icon">
            <i class="${tutorial.icon}"></i>
          </div>
          <div class="tutorial-info">
            <h3>${tutorial.title}</h3>
            <p>${tutorial.description}</p>
            <div class="tutorial-meta">
              <span class="difficulty ${tutorial.difficulty.toLowerCase()}">${tutorial.difficulty}</span>
              <span class="lesson-count">${tutorial.lessons.length} lessons</span>
            </div>
          </div>
        </div>
      `;

      categoryItem.addEventListener('click', () => {
        this.startTutorial(key);
      });

      categoriesContainer.appendChild(categoryItem);
    });

    modal.style.display = 'flex';
  }

  startTutorial(tutorialKey) {
    this.currentTutorial = tutorialKey;
    this.currentLesson = 0;
    this.loadLesson();
  }

  loadLesson() {
    if (!this.currentTutorial) return;

    const tutorial = this.tutorials[this.currentTutorial];
    const lesson = tutorial.lessons[this.currentLesson];
    const lessonContainer = document.getElementById('tutorialLesson');

    lessonContainer.innerHTML = `
      <div class="lesson-header">
        <h2>${lesson.title}</h2>
        <div class="lesson-progress">
          <span>Lesson ${this.currentLesson + 1} of ${tutorial.lessons.length}</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${((this.currentLesson + 1) / tutorial.lessons.length) * 100}%"></div>
          </div>
        </div>
      </div>
      
      <div class="lesson-content">
        <div class="lesson-description">
          ${lesson.instructions}
        </div>
        
        <div class="lesson-code">
          <h4>📝 Code Example:</h4>
          <pre><code>${lesson.code}</code></pre>
          <div class="lesson-actions">
            <button class="btn-primary" id="loadTutorialCode">
              <i class="fas fa-code"></i> Load Code in Editor
            </button>
            <button class="btn-secondary" id="runTutorialCode">
              <i class="fas fa-play"></i> Run Example
            </button>
          </div>
        </div>
        
        <div class="lesson-tasks">
          <h4>✅ Tasks to Complete:</h4>
          <ul>
            ${lesson.tasks.map(task => `<li>${task}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    // Add event listeners for lesson actions
    document.getElementById('loadTutorialCode').addEventListener('click', () => {
      this.loadCodeInEditor(lesson);
    });

    document.getElementById('runTutorialCode').addEventListener('click', () => {
      this.runTutorialCode(lesson);
    });

    // Update navigation buttons
    this.updateNavigationButtons();
  }

  loadCodeInEditor(lesson) {
    // Create a new file with the tutorial code
    const fileName = `tutorial_${this.currentTutorial}_lesson_${this.currentLesson + 1}.py`;
    
    this.ide.project.files.set(fileName, {
      content: lesson.code,
      language: 'python',
      modified: false,
      created: new Date()
    });

    this.ide.updateFileTree();
    this.ide.openFile(fileName);
    
    // Close tutorial modal
    this.closeTutorial();
    
    this.ide.addOutput(`Tutorial code loaded: ${fileName}`, 'system');
  }

  runTutorialCode(lesson) {
    // Create a temporary editor with the lesson code
    const tempFileName = 'tutorial_temp.py';
    
    this.ide.project.files.set(tempFileName, {
      content: lesson.code,
      language: 'python',
      modified: false,
      created: new Date()
    });

    // Open the file and run it
    this.ide.openFile(tempFileName);
    setTimeout(() => {
      this.ide.executeCode();
    }, 500);
  }

  previousLesson() {
    if (this.currentLesson > 0) {
      this.currentLesson--;
      this.loadLesson();
    }
  }

  nextLesson() {
    const tutorial = this.tutorials[this.currentTutorial];
    if (this.currentLesson < tutorial.lessons.length - 1) {
      this.currentLesson++;
      this.loadLesson();
    } else {
      // Tutorial completed
      this.showTutorialCompleted();
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prevLesson');
    const nextBtn = document.getElementById('nextLesson');
    const tutorial = this.tutorials[this.currentTutorial];

    prevBtn.disabled = this.currentLesson === 0;
    
    if (this.currentLesson === tutorial.lessons.length - 1) {
      nextBtn.textContent = 'Complete Tutorial →';
    } else {
      nextBtn.textContent = 'Next Lesson →';
    }
  }

  showTutorialCompleted() {
    const lessonContainer = document.getElementById('tutorialLesson');
    const tutorial = this.tutorials[this.currentTutorial];

    lessonContainer.innerHTML = `
      <div class="tutorial-completed">
        <div class="completion-icon">🎉</div>
        <h2>Tutorial Completed!</h2>
        <p>Congratulations! You've completed the <strong>${tutorial.title}</strong> tutorial.</p>
        
        <div class="completion-stats">
          <div class="stat">
            <span class="stat-number">${tutorial.lessons.length}</span>
            <span class="stat-label">Lessons Completed</span>
          </div>
          <div class="stat">
            <span class="stat-number">${tutorial.difficulty}</span>
            <span class="stat-label">Difficulty Level</span>
          </div>
        </div>
        
        <div class="next-steps">
          <h3>What's Next?</h3>
          <div class="next-actions">
            <button class="btn-primary" id="startAnotherTutorial">
              <i class="fas fa-graduation-cap"></i> Try Another Tutorial
            </button>
            <button class="btn-secondary" id="createProject">
              <i class="fas fa-rocket"></i> Start a Project
            </button>
          </div>
        </div>
        
        <div class="achievement">
          <i class="fas fa-medal"></i>
          <span>Achievement Unlocked: ${tutorial.title} Master!</span>
        </div>
      </div>
    `;

    // Add event listeners
    document.getElementById('startAnotherTutorial').addEventListener('click', () => {
      this.currentTutorial = null;
      this.currentLesson = 0;
      this.openTutorial();
    });

    document.getElementById('createProject').addEventListener('click', () => {
      this.closeTutorial();
      this.ide.handleAction('templates');
    });
  }

  closeTutorial() {
    const modal = document.getElementById('tutorialModal');
    modal.style.display = 'none';
    this.currentTutorial = null;
    this.currentLesson = 0;
  }

  // Add custom CSS for tutorial elements
  addTutorialStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .tutorial-card {
        background: var(--surface-hover);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .tutorial-card:hover {
        transform: translateY(-2px);
        border-color: var(--accent-color);
        box-shadow: 0 4px 20px rgba(76, 175, 80, 0.1);
      }

      .tutorial-icon {
        font-size: 2rem;
        color: var(--accent-color);
      }

      .tutorial-info h3 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
      }

      .tutorial-info p {
        color: var(--text-secondary);
        margin-bottom: 0.8rem;
      }

      .tutorial-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
      }

      .difficulty {
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-weight: 500;
      }

      .difficulty.beginner {
        background: rgba(76, 175, 80, 0.1);
        color: var(--accent-color);
      }

      .difficulty.intermediate {
        background: rgba(255, 152, 0, 0.1);
        color: var(--warning-color);
      }

      .lesson-count {
        color: var(--text-secondary);
      }

      .lesson-header {
        margin-bottom: 2rem;
      }

      .lesson-progress {
        margin-top: 1rem;
      }

      .lesson-code {
        background: var(--surface-hover);
        border-radius: 6px;
        padding: 1rem;
        margin: 1rem 0;
      }

      .lesson-code pre {
        background: var(--editor-bg);
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 0.9rem;
        line-height: 1.4;
      }

      .lesson-actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
      }

      .lesson-tasks {
        background: var(--surface-color);
        border-radius: 6px;
        padding: 1rem;
        margin-top: 1rem;
      }

      .lesson-tasks ul {
        margin-left: 1rem;
      }

      .lesson-tasks li {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
      }

      .tutorial-tip {
        background: rgba(76, 175, 80, 0.1);
        border-left: 4px solid var(--accent-color);
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 4px;
      }

      .tutorial-completed {
        text-align: center;
        padding: 2rem;
      }

      .completion-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .completion-stats {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin: 2rem 0;
      }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: var(--accent-color);
      }

      .stat-label {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }

      .next-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin: 1rem 0;
      }

      .achievement {
        background: linear-gradient(45deg, var(--accent-color), #45a049);
        color: white;
        padding: 1rem;
        border-radius: 6px;
        margin-top: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-weight: 500;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize tutorial styles when the class is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    TutorialSystem.prototype.addTutorialStyles();
  });
} else {
  TutorialSystem.prototype.addTutorialStyles();
}