class PythonIDECore {
  constructor() {
    this.pyodide = null;
    this.monaco = null;
    this.editors = new Map();
    this.currentEditor = null;
    this.isLoading = true;
    this.project = {
      name: 'Untitled Project',
      files: new Map(),
      currentFile: null
    };
    
    this.initialize();
  }

  async initialize() {
    await this.showSplashScreen();
    await this.initializePyodide();
    await this.initializeMonaco();
    this.hideSplashScreen();
    this.setupEventListeners();
    this.initializeDefaultProject();
  }

  async showSplashScreen() {
    const progressFill = document.getElementById('progressFill');
    const loadingText = document.getElementById('loadingText');
    
    const steps = [
      { text: 'Initializing Python environment...', progress: 20 },
      { text: 'Loading Monaco Editor...', progress: 40 },
      { text: 'Setting up file system...', progress: 60 },
      { text: 'Configuring IDE components...', progress: 80 },
      { text: 'Ready to code!', progress: 100 }
    ];

    for (const step of steps) {
      loadingText.textContent = step.text;
      progressFill.style.width = `${step.progress}%`;
      await this.delay(800);
    }
  }

  async initializePyodide() {
    try {
      this.pyodide = await loadPyodide({
        stdout: (text) => this.addOutput(text, 'stdout'),
        stderr: (text) => this.addOutput(text, 'stderr')
      });

      // Load essential packages
      await this.pyodide.loadPackage([
        'micropip', 
        'numpy', 
        'matplotlib', 
        'sqlite3'
      ]);

      // Install additional packages via micropip
      const pip = this.pyodide.pyimport('micropip');
      await pip.install([
        'pillow',
        'requests',
        'beautifulsoup4'
      ]);

      // Setup matplotlib for web
      await this.pyodide.runPython(`
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64

def show_plot():
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    buf.close()
    plt.clf()
    return img_base64
`);

      this.updateStatus('Python environment ready', 'ready');
      
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error);
      this.updateStatus('Python initialization failed', 'error');
      throw error;
    }
  }

  async initializeMonaco() {
    return new Promise((resolve) => {
      require.config({ 
        paths: { 
          'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' 
        } 
      });
      
      require(['vs/editor/editor.main'], () => {
        this.monaco = monaco;
        
        // Configure Python language features
        monaco.languages.setMonarchTokensProvider('python', this.getPythonLanguage());
        monaco.languages.registerCompletionItemProvider('python', this.getCompletionProvider());
        monaco.languages.registerHoverProvider('python', this.getHoverProvider());
        
        resolve();
      });
    });
  }

  hideSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    const ideContainer = document.getElementById('ideContainer');
    
    splashScreen.style.opacity = '0';
    setTimeout(() => {
      splashScreen.style.display = 'none';
      ideContainer.style.display = 'flex';
      this.isLoading = false;
    }, 500);
  }

  setupEventListeners() {
    // Menu actions
    document.querySelectorAll('[data-action]').forEach(element => {
      element.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        this.handleAction(action, e.currentTarget);
      });
    });

    // Sidebar tabs
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchSidebarTab(tab.getAttribute('data-tab'));
      });
    });

    // Panel tabs
    document.querySelectorAll('.panel-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchPanelTab(tab.getAttribute('data-tab'));
      });
    });

    // Theme selector
    document.getElementById('themeSelect').addEventListener('change', (e) => {
      this.changeTheme(e.target.value);
    });

    // Interactive console
    document.getElementById('consoleInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.executeConsoleCommand(e.target.value);
        e.target.value = '';
      }
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcut(e);
    });
  }

  initializeDefaultProject() {
    // Create default files
    const defaultFiles = [
      {
        name: 'main.py',
        content: `# Welcome to Python IDE Studio!
# This is a professional Python development environment

def main():
    print("Hello, Python IDE Studio!")
    print("Start coding your amazing projects here!")
    
    # Example: Simple calculation
    numbers = [1, 2, 3, 4, 5]
    total = sum(numbers)
    average = total / len(numbers)
    
    print(f"Numbers: {numbers}")
    print(f"Sum: {total}")
    print(f"Average: {average}")

if __name__ == "__main__":
    main()
`,
        language: 'python'
      },
      {
        name: 'requirements.txt',
        content: `# Project dependencies
numpy>=1.21.0
matplotlib>=3.5.0
requests>=2.28.0
pillow>=9.0.0
`,
        language: 'text'
      },
      {
        name: 'README.md',
        content: `# My Python Project

Created with Python IDE Studio - Professional Development Environment

## Features

- Advanced code editing with Monaco Editor
- Real-time Python execution with Pyodide
- Interactive debugging and profiling
- Package management with pip
- Git version control simulation
- Data visualization with matplotlib
- AI-powered code assistance

## Getting Started

1. Edit your code in the main.py file
2. Use Ctrl+Enter to run your code
3. Explore the various IDE features in the sidebar and panels

Happy coding! 🐍
`,
        language: 'markdown'
      }
    ];

    defaultFiles.forEach(file => {
      this.project.files.set(file.name, {
        content: file.content,
        language: file.language,
        modified: false,
        created: new Date()
      });
    });

    this.updateFileTree();
    this.openFile('main.py');
  }

  handleAction(action, element) {
    const actions = {
      'new-project': () => this.newProject(),
      'open-tutorial': () => this.openTutorial(),
      'templates': () => this.showTemplates(),
      'packages': () => this.switchSidebarTab('packages'),
      'new-file': () => this.createNewFile(),
      'new-folder': () => this.createNewFolder(),
      'upload-file': () => this.uploadFiles(),
      'split-editor': () => this.splitEditor(),
      'close-all': () => this.closeAllTabs(),
      'clear-output': () => this.clearOutput(),
      'clear-console': () => this.clearConsole(),
      'format': () => this.formatCode(),
      'commit': () => this.commitChanges(),
      'ai-assistant': () => this.openAIAssistant(),
      'upload-project': () => this.uploadProject()
    };

    if (actions[action]) {
      actions[action]();
    }
  }

  async executeCode() {
    if (!this.currentEditor || this.isLoading) return;

    const code = this.currentEditor.getValue();
    if (!code.trim()) {
      this.addOutput('No code to execute', 'stderr');
      return;
    }

    this.updateStatus('Running code...', 'running');
    this.addOutput('--- Execution Started ---', 'system');
    
    const startTime = performance.now();

    try {
      // Clear previous outputs
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

      // Execute the code
      await this.pyodide.runPython(code);

      // Get outputs
      const stdout = await this.pyodide.runPython('stdout_buffer.getvalue()');
      const stderr = await this.pyodide.runPython('stderr_buffer.getvalue()');

      // Restore stdout and stderr
      await this.pyodide.runPython(`
sys.stdout = old_stdout
sys.stderr = old_stderr
`);

      if (stdout) this.addOutput(stdout, 'stdout');
      if (stderr) this.addOutput(stderr, 'stderr');

      // Check for matplotlib plots
      try {
        const plotData = await this.pyodide.runPython('show_plot()');
        if (plotData && plotData !== 'None') {
          this.displayPlot(plotData);
        }
      } catch (e) {
        // No plot to show
      }

      const executionTime = (performance.now() - startTime).toFixed(2);
      this.addOutput(`--- Execution completed in ${executionTime}ms ---`, 'system');
      this.updateStatus('Ready', 'ready');

    } catch (error) {
      this.addOutput(`Error: ${error.message}`, 'stderr');
      
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

      const executionTime = (performance.now() - startTime).toFixed(2);
      this.addOutput(`--- Execution failed in ${executionTime}ms ---`, 'system');
      this.updateStatus('Execution failed', 'error');
    }
  }

  createEditor(fileName, content, language = 'python') {
    const editorContainer = document.getElementById('editorContainer');
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    if (welcomeScreen) {
      welcomeScreen.style.display = 'none';
    }

    const editor = this.monaco.editor.create(editorContainer, {
      value: content,
      language: language,
      theme: 'vs-dark',
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      hover: { enabled: true }
    });

    this.editors.set(fileName, editor);
    this.currentEditor = editor;

    // Track changes
    editor.onDidChangeModelContent(() => {
      const file = this.project.files.get(fileName);
      if (file) {
        file.modified = true;
        file.content = editor.getValue();
        this.updateFileTree();
        this.updateGitStatus();
      }
    });

    // Update cursor position
    editor.onDidChangeCursorPosition((e) => {
      document.getElementById('cursorPosition').textContent = 
        `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
    });

    this.addTab(fileName);
    this.project.currentFile = fileName;
    
    return editor;
  }

  openFile(fileName) {
    const file = this.project.files.get(fileName);
    if (!file) return;

    // Check if editor already exists
    if (this.editors.has(fileName)) {
      this.switchToEditor(fileName);
      return;
    }

    // Create new editor
    this.createEditor(fileName, file.content, file.language);
  }

  switchToEditor(fileName) {
    // Hide all editors
    this.editors.forEach((editor, name) => {
      editor.getDomNode().style.display = name === fileName ? 'block' : 'none';
    });

    this.currentEditor = this.editors.get(fileName);
    this.project.currentFile = fileName;
    this.updateActiveTab(fileName);
  }

  addTab(fileName) {
    const tabBar = document.getElementById('tabBar');
    const existingTab = tabBar.querySelector(`[data-file="${fileName}"]`);
    
    if (existingTab) {
      this.updateActiveTab(fileName);
      return;
    }

    const tab = document.createElement('div');
    tab.className = 'editor-tab active';
    tab.setAttribute('data-file', fileName);
    tab.innerHTML = `
      <i class="fas fa-file-code"></i>
      <span>${fileName}</span>
      <span class="tab-close" onclick="event.stopPropagation(); window.ideCore.closeTab('${fileName}')">&times;</span>
    `;

    tab.addEventListener('click', () => {
      this.switchToEditor(fileName);
    });

    const tabControls = tabBar.querySelector('.tab-controls');
    tabBar.insertBefore(tab, tabControls);
    this.updateActiveTab(fileName);
  }

  updateActiveTab(fileName) {
    document.querySelectorAll('.editor-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-file') === fileName);
    });
  }

  closeTab(fileName) {
    const editor = this.editors.get(fileName);
    if (editor) {
      editor.dispose();
      this.editors.delete(fileName);
    }

    const tab = document.querySelector(`[data-file="${fileName}"]`);
    if (tab) {
      tab.remove();
    }

    // Switch to another tab if this was the active one
    if (this.project.currentFile === fileName) {
      const remainingTabs = document.querySelectorAll('.editor-tab:not(.tab-controls)');
      if (remainingTabs.length > 0) {
        const nextFileName = remainingTabs[0].getAttribute('data-file');
        this.switchToEditor(nextFileName);
      } else {
        this.showWelcomeScreen();
      }
    }
  }

  showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const editorContainer = document.getElementById('editorContainer');
    
    this.editors.forEach(editor => {
      editor.getDomNode().style.display = 'none';
    });
    
    welcomeScreen.style.display = 'flex';
    this.currentEditor = null;
    this.project.currentFile = null;
  }

  updateFileTree() {
    const fileTree = document.getElementById('fileTree');
    fileTree.innerHTML = '';

    this.project.files.forEach((file, fileName) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      if (fileName === this.project.currentFile) {
        fileItem.classList.add('active');
      }
      
      const icon = this.getFileIcon(fileName);
      const modifiedIndicator = file.modified ? ' •' : '';
      
      fileItem.innerHTML = `
        <i class="file-icon ${icon}"></i>
        <span>${fileName}${modifiedIndicator}</span>
      `;

      fileItem.addEventListener('click', () => {
        this.openFile(fileName);
      });

      fileTree.appendChild(fileItem);
    });
  }

  getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      'py': 'fab fa-python',
      'js': 'fab fa-js',
      'html': 'fab fa-html5',
      'css': 'fab fa-css3',
      'json': 'fas fa-brackets-curly',
      'md': 'fab fa-markdown',
      'txt': 'fas fa-file-alt',
      'sql': 'fas fa-database'
    };
    return iconMap[ext] || 'fas fa-file';
  }

  switchSidebarTab(tabName) {
    // Update active tab
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    // Show corresponding content
    document.querySelectorAll('.sidebar-content').forEach(content => {
      content.style.display = 
        content.getAttribute('data-content') === tabName ? 'block' : 'none';
    });
  }

  switchPanelTab(tabName) {
    // Update active tab
    document.querySelectorAll('.panel-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    // Show corresponding content
    document.querySelectorAll('.panel-content').forEach(content => {
      content.style.display = 
        content.getAttribute('data-content') === tabName ? 'block' : 'none';
    });
  }

  addOutput(text, type = 'stdout') {
    const outputConsole = document.getElementById('outputConsole');
    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    
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

    outputConsole.appendChild(line);
    outputConsole.scrollTop = outputConsole.scrollHeight;
  }

  displayPlot(base64Data) {
    const plotsContainer = document.getElementById('plotsContainer');
    plotsContainer.innerHTML = '';
    
    const img = document.createElement('img');
    img.src = `data:image/png;base64,${base64Data}`;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.borderRadius = '6px';
    img.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    
    plotsContainer.appendChild(img);
    
    // Switch to plots tab
    this.switchPanelTab('plots');
  }

  updateStatus(text, type = 'ready') {
    document.getElementById('statusText').textContent = text;
    const indicator = document.getElementById('statusIndicator');
    indicator.className = `fas fa-circle status-indicator ${type}`;
  }

  clearOutput() {
    document.getElementById('outputConsole').innerHTML = '';
  }

  clearConsole() {
    document.getElementById('consoleHistory').innerHTML = '';
  }

  changeTheme(themeName) {
    if (this.currentEditor) {
      this.monaco.editor.setTheme(themeName);
    }
    // Update all editors
    this.editors.forEach(editor => {
      this.monaco.editor.setTheme(themeName);
    });
  }

  formatCode() {
    if (this.currentEditor) {
      this.currentEditor.getAction('editor.action.formatDocument').run();
    }
  }

  handleKeyboardShortcut(e) {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'Enter':
          e.preventDefault();
          this.executeCode();
          break;
        case 's':
          e.preventDefault();
          this.saveCurrentFile();
          break;
        case 'n':
          e.preventDefault();
          this.createNewFile();
          break;
        case 'o':
          e.preventDefault();
          this.uploadFiles();
          break;
        case 'f':
          e.preventDefault();
          this.formatCode();
          break;
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Placeholder methods for features to be implemented in other files
  newProject() { console.log('New project - to be implemented'); }
  openTutorial() { console.log('Tutorial - to be implemented'); }
  showTemplates() { console.log('Templates - to be implemented'); }
  createNewFile() { console.log('New file - to be implemented'); }
  createNewFolder() { console.log('New folder - to be implemented'); }
  uploadFiles() { console.log('Upload files - to be implemented'); }
  splitEditor() { console.log('Split editor - to be implemented'); }
  closeAllTabs() { console.log('Close all tabs - to be implemented'); }
  commitChanges() { console.log('Commit changes - to be implemented'); }
  openAIAssistant() { console.log('AI Assistant - to be implemented'); }
  uploadProject() { console.log('Upload project - to be implemented'); }
  executeConsoleCommand(command) { console.log('Console command:', command); }
  saveCurrentFile() { console.log('Save file - to be implemented'); }
  updateGitStatus() { console.log('Update git status - to be implemented'); }

  getPythonLanguage() {
    return {
      defaultToken: 'invalid',
      keywords: [
        'False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class',
        'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
        'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
        'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
        'while', 'with', 'yield'
      ],
      builtins: [
        'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes',
        'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr',
        'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'filter',
        'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr',
        'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance',
        'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max',
        'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord',
        'pow', 'print', 'property', 'range', 'repr', 'reversed', 'round',
        'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum',
        'super', 'tuple', 'type', 'vars', 'zip'
      ],
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@builtins': 'type.identifier',
              '@default': 'identifier'
            }
          }],
          [/[0-9]+(\.[0-9]*)?([eE][-+]?[0-9]+)?/, 'number'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/'/, { token: 'string.quote', bracket: '@open', next: '@stringsingle' }],
          [/#.*$/, 'comment'],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape.invalid'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],
        stringsingle: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape.invalid'],
          [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ]
      }
    };
  }

  getCompletionProvider() {
    return {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = [
          {
            label: 'print',
            kind: this.monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1})',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'if',
            kind: this.monaco.languages.CompletionItemKind.Keyword,
            insertText: 'if ${1:condition}:\n\t${2}',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'for',
            kind: this.monaco.languages.CompletionItemKind.Keyword,
            insertText: 'for ${1:item} in ${2:iterable}:\n\t${3}',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'def',
            kind: this.monaco.languages.CompletionItemKind.Keyword,
            insertText: 'def ${1:function_name}(${2}):\n\t${3}',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          }
        ];

        return { suggestions };
      }
    };
  }

  getHoverProvider() {
    return {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return;

        const hoverInfo = {
          'print': 'Built-in function to output text to the console',
          'len': 'Return the length (the number of items) of an object',
          'range': 'Create a sequence of numbers',
          'str': 'Return a string version of an object'
        };

        const info = hoverInfo[word.word];
        if (info) {
          return {
            range: new this.monaco.Range(
              position.lineNumber, word.startColumn,
              position.lineNumber, word.endColumn
            ),
            contents: [{ value: `**${word.word}**: ${info}` }]
          };
        }
      }
    };
  }
}