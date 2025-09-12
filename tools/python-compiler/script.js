class PythonCompiler {
  constructor() {
    this.pyodide = null;
    this.editor = null;
    this.isLoading = true;
    this.isRunning = false;
    
    this.initializeElements();
    this.initializeEditor();
    this.initializePyodide();
    this.bindEvents();
  }

  initializeElements() {
    this.elements = {
      fileInput: document.getElementById('fileInput'),
      uploadBtn: document.getElementById('uploadBtn'),
      downloadBtn: document.getElementById('downloadBtn'),
      runBtn: document.getElementById('runBtn'),
      clearBtn: document.getElementById('clearBtn'),
      clearOutputBtn: document.getElementById('clearOutputBtn'),
      codeEditor: document.getElementById('codeEditor'),
      outputConsole: document.getElementById('outputConsole'),
      statusText: document.getElementById('statusText'),
      cursorPos: document.getElementById('cursorPos'),
      loadingOverlay: document.getElementById('loadingOverlay')
    };
  }

  initializeEditor() {
    this.editor = CodeMirror.fromTextArea(this.elements.codeEditor, {
      mode: 'python',
      theme: 'dracula',
      lineNumbers: true,
      indentUnit: 4,
      indentWithTabs: false,
      matchBrackets: true,
      autoCloseBrackets: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    });

    // Update cursor position
    this.editor.on('cursorActivity', () => {
      const cursor = this.editor.getCursor();
      this.elements.cursorPos.textContent = `Line ${cursor.line + 1}, Col ${cursor.ch + 1}`;
    });

    // Update status on change
    this.editor.on('change', () => {
      this.updateStatus('Modified');
    });
  }

  async initializePyodide() {
    this.showLoading(true);
    this.updateStatus('Loading Python environment...');
    
    try {
      this.pyodide = await loadPyodide({
        stdout: (text) => this.addOutput(text, 'stdout'),
        stderr: (text) => this.addOutput(text, 'stderr')
      });

      // Install common packages
      await this.pyodide.loadPackage(['micropip', 'numpy']);
      
      // Install additional GUI and utility packages
      const pip = this.pyodide.pyimport('micropip');
      await pip.install(['pillow']);

      this.isLoading = false;
      this.showLoading(false);
      this.updateStatus('Ready');
      this.addOutput('Python environment loaded successfully!', 'system');
      this.addOutput('Available packages: numpy, pillow, tkinter (built-in), and standard library', 'system');
      this.addOutput('Ready to run your Python code!\n', 'system');
      
    } catch (error) {
      this.isLoading = false;
      this.showLoading(false);
      this.updateStatus('Error loading Python');
      this.addOutput(`Error loading Python environment: ${error.message}`, 'stderr');
    }
  }

  bindEvents() {
    // File upload
    this.elements.uploadBtn.addEventListener('click', () => {
      this.elements.fileInput.click();
    });

    this.elements.fileInput.addEventListener('change', (e) => {
      this.handleFileUpload(e.target.files[0]);
    });

    // Download file
    this.elements.downloadBtn.addEventListener('click', () => {
      this.downloadCode();
    });

    // Run code
    this.elements.runBtn.addEventListener('click', () => {
      this.runCode();
    });

    // Clear editor
    this.elements.clearBtn.addEventListener('click', () => {
      this.clearEditor();
    });

    // Clear output
    this.elements.clearOutputBtn.addEventListener('click', () => {
      this.clearOutput();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'Enter':
            e.preventDefault();
            this.runCode();
            break;
          case 's':
            e.preventDefault();
            this.downloadCode();
            break;
        }
      }
    });

    // Drag and drop
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].name.endsWith('.py')) {
        this.handleFileUpload(files[0]);
      }
    });
  }

  handleFileUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      this.editor.setValue(content);
      this.updateStatus(`Loaded: ${file.name}`);
      this.addOutput(`File uploaded: ${file.name}`, 'system');
    };
    reader.readAsText(file);
  }

  downloadCode() {
    const code = this.editor.getValue();
    if (!code.trim()) {
      this.addOutput('No code to download', 'stderr');
      return;
    }

    const blob = new Blob([code], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'python_code.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.addOutput('Code downloaded as python_code.py', 'system');
  }

  async runCode() {
    if (this.isLoading) {
      this.addOutput('Python environment is still loading...', 'stderr');
      return;
    }

    if (this.isRunning) {
      this.addOutput('Code is already running...', 'stderr');
      return;
    }

    const code = this.editor.getValue().trim();
    if (!code) {
      this.addOutput('No code to run', 'stderr');
      return;
    }

    this.isRunning = true;
    this.elements.runBtn.disabled = true;
    this.elements.runBtn.innerHTML = '<span class="icon">⏸️</span> Running...';
    this.updateStatus('Running...');

    this.addOutput('--- Execution Started ---', 'system');
    const startTime = Date.now();

    try {
      // Clear previous GUI windows if any
      await this.pyodide.runPython(`
import sys
import io
import traceback

# Redirect stdout and stderr
old_stdout = sys.stdout
old_stderr = sys.stderr
stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()
sys.stdout = stdout_buffer
sys.stderr = stderr_buffer
`);

      // Run the user code
      await this.pyodide.runPython(code);

      // Get the output
      const stdout = await this.pyodide.runPython('stdout_buffer.getvalue()');
      const stderr = await this.pyodide.runPython('stderr_buffer.getvalue()');

      // Restore stdout and stderr
      await this.pyodide.runPython(`
sys.stdout = old_stdout
sys.stderr = old_stderr
`);

      if (stdout) {
        this.addOutput(stdout, 'stdout');
      }
      if (stderr) {
        this.addOutput(stderr, 'stderr');
      }

      const executionTime = Date.now() - startTime;
      this.addOutput(`--- Execution completed in ${executionTime}ms ---`, 'system');
      this.updateStatus('Execution completed');

    } catch (error) {
      this.addOutput(`Error: ${error.message}`, 'stderr');
      
      // Try to get Python traceback
      try {
        const traceback = await this.pyodide.runPython(`
import traceback
traceback.format_exc()
`);
        if (traceback && traceback !== 'NoneType: None\n') {
          this.addOutput(`\nTraceback:\n${traceback}`, 'stderr');
        }
      } catch (e) {
        // Ignore traceback errors
      }

      const executionTime = Date.now() - startTime;
      this.addOutput(`--- Execution failed in ${executionTime}ms ---`, 'system');
      this.updateStatus('Execution failed');
    } finally {
      this.isRunning = false;
      this.elements.runBtn.disabled = false;
      this.elements.runBtn.innerHTML = '<span class="icon">▶️</span> Run Code';
    }
  }

  clearEditor() {
    this.editor.setValue('');
    this.updateStatus('Editor cleared');
    this.addOutput('Editor cleared', 'system');
  }

  clearOutput() {
    this.elements.outputConsole.innerHTML = '';
    this.addOutput('Output cleared', 'system');
  }

  addOutput(text, type = 'stdout') {
    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    
    // Handle different output types
    switch(type) {
      case 'system':
        line.textContent = `[SYSTEM] ${text}`;
        break;
      case 'stderr':
        line.textContent = `[ERROR] ${text}`;
        break;
      default:
        line.textContent = text;
    }
    
    this.elements.outputConsole.appendChild(line);
    this.elements.outputConsole.scrollTop = this.elements.outputConsole.scrollHeight;
  }

  updateStatus(status) {
    this.elements.statusText.textContent = status;
  }

  showLoading(show) {
    if (show) {
      this.elements.loadingOverlay.classList.add('show');
    } else {
      this.elements.loadingOverlay.classList.remove('show');
    }
  }
}

// Initialize the compiler when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new PythonCompiler();
});

// Add some example code snippets
const examples = {
  hello: `# Hello World Example
print("Hello, Python World!")
print("Welcome to the online Python compiler!")

# Basic calculations
x = 10
y = 20
result = x + y
print(f"The sum of {x} and {y} is {result}")`,

  gui: `# Simple GUI Example using tkinter
import tkinter as tk
from tkinter import messagebox

def say_hello():
    messagebox.showinfo("Hello", "Hello from Python GUI!")

def calculate():
    try:
        num1 = float(entry1.get())
        num2 = float(entry2.get())
        result = num1 + num2
        result_label.config(text=f"Result: {result}")
    except ValueError:
        messagebox.showerror("Error", "Please enter valid numbers!")

# Create main window
root = tk.Tk()
root.title("Python GUI Calculator")
root.geometry("300x250")

# Create widgets
tk.Label(root, text="Simple Calculator", font=("Arial", 16)).pack(pady=10)

frame = tk.Frame(root)
frame.pack(pady=10)

tk.Label(frame, text="Number 1:").grid(row=0, column=0, padx=5)
entry1 = tk.Entry(frame)
entry1.grid(row=0, column=1, padx=5)

tk.Label(frame, text="Number 2:").grid(row=1, column=0, padx=5)
entry2 = tk.Entry(frame)
entry2.grid(row=1, column=1, padx=5)

tk.Button(root, text="Calculate", command=calculate).pack(pady=10)
result_label = tk.Label(root, text="Result: ", font=("Arial", 12))
result_label.pack(pady=5)

tk.Button(root, text="Say Hello", command=say_hello).pack(pady=5)

# Start the GUI event loop
root.mainloop()`,

  dataProcessing: `# Data Processing Example
import math
import random

# Generate sample data
print("Generating sample data...")
data = [random.randint(1, 100) for _ in range(50)]
print(f"Generated {len(data)} random numbers")

# Statistical analysis
mean = sum(data) / len(data)
variance = sum((x - mean) ** 2 for x in data) / len(data)
std_dev = math.sqrt(variance)

print(f"\\nStatistical Analysis:")
print(f"Mean: {mean:.2f}")
print(f"Standard Deviation: {std_dev:.2f}")
print(f"Min: {min(data)}")
print(f"Max: {max(data)}")

# Find numbers above average
above_avg = [x for x in data if x > mean]
print(f"\\nNumbers above average: {len(above_avg)}")
print(f"Above average values: {above_avg[:10]}...")  # Show first 10`
};

// Make examples available globally for easy testing
window.examples = examples;