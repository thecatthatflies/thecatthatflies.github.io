function startDebugging() {
  ideCore.addOutput('🐛 Starting debugger...', 'system');
  ideCore.switchPanelTab('debugger');
  
  // Simulate debugger functionality
  const variablesList = document.getElementById('variablesList');
  const callStack = document.getElementById('callStack');
  const breakpointsList = document.getElementById('breakpointsList');

  variablesList.innerHTML = `
    <div class="variable-item">
      <span class="variable-name">x:</span>
      <span class="variable-value">10</span>
    </div>
    <div class="variable-item">
      <span class="variable-name">name:</span>
      <span class="variable-value">"Alice"</span>
    </div>
    <div class="variable-item">
      <span class="variable-name">is_active:</span>
      <span class="variable-value">True</span>
    </div>
  `;

  callStack.innerHTML = `
    <div class="stack-item">
      <span class="stack-function">main()</span>
      <span class="stack-line">main.py:15</span>
    </div>
    <div class="stack-item">
      <span class="stack-function">calculate_sum()</span>
      <span class="stack-line">utils.py:22</span>
    </div>
  `;

  breakpointsList.innerHTML = `
    <div class="breakpoint-item">
      <span class="breakpoint-file">main.py:10</span>
      <span class="breakpoint-status">active</span>
    </div>
  `;

  ideCore.addOutput('Debugger attached. Execution paused at breakpoint.', 'system');
}

function executeConsoleCommand(command) {
  const consoleHistory = document.getElementById('consoleHistory');
  const input = document.getElementById('consoleInput');

  // Add command to history
  const commandLine = document.createElement('div');
  commandLine.className = 'console-line user-input';
  commandLine.innerHTML = `<span class="console-prompt">>>> </span>${command}`;
  consoleHistory.appendChild(commandLine);

  ideCore.addOutput(`>>> ${command}`, 'stdout'); // Also show in main output

  // Simulate Python execution in console
  ideCore.pyodide.runPythonAsync(command)
    .then(result => {
      const outputLine = document.createElement('div');
      outputLine.className = 'console-line console-output';
      outputLine.textContent = result !== undefined ? String(result) : '';
      consoleHistory.appendChild(outputLine);
      consoleHistory.scrollTop = consoleHistory.scrollHeight;
      ideCore.addOutput(result !== undefined ? String(result) : '', 'stdout');
    })
    .catch(error => {
      const errorLine = document.createElement('div');
      errorLine.className = 'console-line console-error';
      errorLine.textContent = `Error: ${error.message}`;
      consoleHistory.appendChild(errorLine);
      consoleHistory.scrollTop = consoleHistory.scrollHeight;
      ideCore.addOutput(`Error: ${error.message}`, 'stderr');
    });
}

function saveCurrentFile() {
  if (ideCore.project.currentFile) {
    fileManager.saveFile(ideCore.project.currentFile);
  } else {
    ideCore.addOutput('No file open to save.', 'stderr');
  }
}

function uploadProject() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await fileManager.importProject(file);
      document.getElementById('activeProject').textContent = ideCore.project.name;
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();
  document.body.removeChild(fileInput);
}

function showErrorMessage(message) {
  const ideContainer = document.getElementById('ideContainer');
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #f44336;
    color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 9999;
    font-size: 1.2rem;
    text-align: center;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Global access for debugging/testing
window.ideCore = ideCore;
window.fileManager = fileManager;
window.tutorialSystem = tutorialSystem;
window.aiAssistant = aiAssistant;
window.packageManager = packageManager;
window.gitSimulator = gitSimulator;