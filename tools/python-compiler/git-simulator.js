class GitSimulator {
  constructor(ideCore) {
    this.ide = ideCore;
    this.repository = {
      name: this.ide.project.name,
      commits: [],
      branches: ['main'],
      currentBranch: 'main',
      stagedFiles: new Set(),
      modifiedFiles: new Set()
    };
    this.setupGitUI();
    this.initializeRepository();
  }

  initializeRepository() {
    // Initial commit
    this.commit('Initial commit', 'System', true);
    this.updateGitStatus();
  }

  setupGitUI() {
    this.updateGitStatus();
    this.updateCommitHistory();
  }

  updateGitStatus() {
    const changedFiles = document.getElementById('changedFiles');
    changedFiles.innerHTML = '';

    // Check for modified files
    this.repository.modifiedFiles.clear();
    this.ide.project.files.forEach((file, fileName) => {
      if (file.modified) {
        this.repository.modifiedFiles.add(fileName);
      }
    });

    if (this.repository.modifiedFiles.size === 0) {
      changedFiles.innerHTML = `
        <div class="git-status-clean">
          <i class="fas fa-check-circle"></i>
          <p>Working directory clean</p>
        </div>
      `;
      return;
    }

    // Show modified files
    this.repository.modifiedFiles.forEach(fileName => {
      const isStaged = this.repository.stagedFiles.has(fileName);
      const fileItem = document.createElement('div');
      fileItem.className = `git-file-item ${isStaged ? 'staged' : 'modified'}`;
      fileItem.innerHTML = `
        <div class="file-status">
          <i class="fas ${isStaged ? 'fa-plus' : 'fa-pencil-alt'}"></i>
          <span class="file-name">${fileName}</span>
          <span class="file-status-text">${isStaged ? 'staged' : 'modified'}</span>
        </div>
        <div class="file-actions">
          ${!isStaged ? 
            `<button class="git-btn stage" data-file="${fileName}">
              <i class="fas fa-plus"></i> Stage
            </button>` :
            `<button class="git-btn unstage" data-file="${fileName}">
              <i class="fas fa-minus"></i> Unstage
            </button>`
          }
          <button class="git-btn diff" data-file="${fileName}">
            <i class="fas fa-eye"></i> View
          </button>
        </div>
      `;

      // Add event listeners
      const stageBtn = fileItem.querySelector('.stage');
      const unstageBtn = fileItem.querySelector('.unstage');
      const diffBtn = fileItem.querySelector('.diff');

      if (stageBtn) {
        stageBtn.addEventListener('click', () => this.stageFile(fileName));
      }
      if (unstageBtn) {
        unstageBtn.addEventListener('click', () => this.unstageFile(fileName));
      }
      if (diffBtn) {
        diffBtn.addEventListener('click', () => this.showFileDiff(fileName));
      }

      changedFiles.appendChild(fileItem);
    });

    // Add stage all and commit controls if there are changes
    if (this.repository.modifiedFiles.size > 0) {
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'git-controls';
      controlsDiv.innerHTML = `
        <div class="git-actions">
          <button class="git-btn stage-all" id="stageAllBtn">
            <i class="fas fa-plus"></i> Stage All
          </button>
          ${this.repository.stagedFiles.size > 0 ? 
            `<button class="git-btn commit-btn" id="commitBtn">
              <i class="fas fa-check"></i> Commit (${this.repository.stagedFiles.size})
            </button>` : ''
          }
        </div>
        
        ${this.repository.stagedFiles.size > 0 ? 
          `<div class="commit-form">
            <textarea id="commitMessage" placeholder="Enter commit message..." rows="2"></textarea>
            <div class="commit-form-actions">
              <button class="git-btn commit-confirm" id="confirmCommit">
                <i class="fas fa-code-branch"></i> Commit Changes
              </button>
              <button class="git-btn cancel" id="cancelCommit">Cancel</button>
            </div>
          </div>` : ''
        }
      `;

      // Add event listeners
      const stageAllBtn = controlsDiv.querySelector('#stageAllBtn');
      const commitBtn = controlsDiv.querySelector('#commitBtn');
      const confirmCommitBtn = controlsDiv.querySelector('#confirmCommit');
      const cancelCommitBtn = controlsDiv.querySelector('#cancelCommit');

      if (stageAllBtn) {
        stageAllBtn.addEventListener('click', () => this.stageAllFiles());
      }
      if (commitBtn) {
        commitBtn.addEventListener('click', () => this.toggleCommitForm());
      }
      if (confirmCommitBtn) {
        confirmCommitBtn.addEventListener('click', () => this.performCommit());
      }
      if (cancelCommitBtn) {
        cancelCommitBtn.addEventListener('click', () => this.cancelCommit());
      }

      changedFiles.appendChild(controlsDiv);
    }
  }

  stageFile(fileName) {
    this.repository.stagedFiles.add(fileName);
    this.updateGitStatus();
    this.ide.addOutput(`📁 Staged: ${fileName}`, 'system');
  }

  unstageFile(fileName) {
    this.repository.stagedFiles.delete(fileName);
    this.updateGitStatus();
    this.ide.addOutput(`📁 Unstaged: ${fileName}`, 'system');
  }

  stageAllFiles() {
    this.repository.modifiedFiles.forEach(fileName => {
      this.repository.stagedFiles.add(fileName);
    });
    this.updateGitStatus();
    this.ide.addOutput(`📁 Staged all modified files (${this.repository.stagedFiles.size} files)`, 'system');
  }

  toggleCommitForm() {
    const commitForm = document.querySelector('.commit-form');
    const commitBtn = document.getElementById('commitBtn');
    
    if (commitForm.style.display === 'none' || !commitForm.style.display) {
      commitForm.style.display = 'block';
      commitBtn.style.display = 'none';
      document.getElementById('commitMessage').focus();
    } else {
      commitForm.style.display = 'none';
      commitBtn.style.display = 'inline-flex';
    }
  }

  performCommit() {
    const messageInput = document.getElementById('commitMessage');
    const message = messageInput.value.trim();

    if (!message) {
      alert('Please enter a commit message');
      return;
    }

    if (this.repository.stagedFiles.size === 0) {
      alert('No files staged for commit');
      return;
    }

    this.commit(message, 'Developer');
    this.ide.addOutput(`✅ Committed ${this.repository.stagedFiles.size} files: "${message}"`, 'system');

    // Clear staged files and reset form
    this.repository.stagedFiles.clear();
    this.markFilesAsCommitted();
    this.updateGitStatus();
    this.updateCommitHistory();
    messageInput.value = '';
  }

  cancelCommit() {
    const commitForm = document.querySelector('.commit-form');
    const commitBtn = document.getElementById('commitBtn');
    const messageInput = document.getElementById('commitMessage');
    
    commitForm.style.display = 'none';
    commitBtn.style.display = 'inline-flex';
    messageInput.value = '';
  }

  commit(message, author, isInitial = false) {
    const commitId = this.generateCommitId();
    const timestamp = new Date();
    
    const committedFiles = isInitial ? 
      Array.from(this.ide.project.files.keys()) : 
      Array.from(this.repository.stagedFiles);

    const commit = {
      id: commitId,
      message: message,
      author: author,
      timestamp: timestamp,
      files: committedFiles,
      branch: this.repository.currentBranch
    };

    this.repository.commits.unshift(commit);

    // Limit commit history to last 20 commits
    if (this.repository.commits.length > 20) {
      this.repository.commits = this.repository.commits.slice(0, 20);
    }
  }

  markFilesAsCommitted() {
    this.repository.stagedFiles.forEach(fileName => {
      const file = this.ide.project.files.get(fileName);
      if (file) {
        file.modified = false;
      }
    });
    this.ide.updateFileTree();
  }

  updateCommitHistory() {
    const historyContainer = document.getElementById('commitHistory');
    historyContainer.innerHTML = '';

    if (this.repository.commits.length === 0) {
      historyContainer.innerHTML = `
        <div class="git-empty">
          <i class="fas fa-code-branch"></i>
          <p>No commits yet</p>
        </div>
      `;
      return;
    }

    this.repository.commits.forEach((commit, index) => {
      const commitItem = document.createElement('div');
      commitItem.className = 'commit-item';
      commitItem.innerHTML = `
        <div class="commit-header">
          <div class="commit-info">
            <i class="fas fa-code-branch"></i>
            <span class="commit-id">${commit.id.substring(0, 7)}</span>
            <span class="commit-message">${commit.message}</span>
          </div>
          <div class="commit-actions">
            <button class="git-btn view-commit" data-commit="${commit.id}">
              <i class="fas fa-eye"></i>
            </button>
            ${index > 0 ? 
              `<button class="git-btn revert-commit" data-commit="${commit.id}">
                <i class="fas fa-undo"></i>
              </button>` : ''
            }
          </div>
        </div>
        <div class="commit-meta">
          <span class="commit-author">by ${commit.author}</span>
          <span class="commit-time">${this.formatTime(commit.timestamp)}</span>
          <span class="commit-files">${commit.files.length} file${commit.files.length !== 1 ? 's' : ''}</span>
        </div>
      `;

      // Add event listeners
      const viewBtn = commitItem.querySelector('.view-commit');
      const revertBtn = commitItem.querySelector('.revert-commit');

      viewBtn.addEventListener('click', () => this.viewCommit(commit.id));
      if (revertBtn) {
        revertBtn.addEventListener('click', () => this.revertCommit(commit.id));
      }

      historyContainer.appendChild(commitItem);
    });
  }

  viewCommit(commitId) {
    const commit = this.repository.commits.find(c => c.id === commitId);
    if (!commit) return;

    let content = `
      <h3>Commit Details</h3>
      <div class="commit-details">
        <p><strong>ID:</strong> ${commit.id}</p>
        <p><strong>Message:</strong> ${commit.message}</p>
        <p><strong>Author:</strong> ${commit.author}</p>
        <p><strong>Date:</strong> ${commit.timestamp.toLocaleString()}</p>
        <p><strong>Branch:</strong> ${commit.branch}</p>
      </div>
      
      <h4>Changed Files (${commit.files.length})</h4>
      <div class="commit-files">
        ${commit.files.map(fileName => `
          <div class="commit-file">
            <i class="fas ${this.getFileIcon(fileName)}"></i>
            <span>${fileName}</span>
          </div>
        `).join('')}
      </div>
    `;

    this.showGitModal('Commit Details', content);
  }

  revertCommit(commitId) {
    if (confirm('Are you sure you want to revert this commit? This will undo the changes.')) {
      this.ide.addOutput(`🔄 Reverted commit ${commitId.substring(0, 7)}`, 'system');
      // In a real implementation, you would restore the files to their previous state
    }
  }

  showFileDiff(fileName) {
    const file = this.ide.project.files.get(fileName);
    if (!file) return;

    // Simulate showing file differences
    const content = `
      <h3>File Changes: ${fileName}</h3>
      <div class="file-diff">
        <div class="diff-stats">
          <span class="additions">+12 additions</span>
          <span class="deletions">-5 deletions</span>
        </div>
        <div class="diff-content">
          <pre><code># This is a simplified diff view
# In a real Git implementation, you would see:
# - Lines that were removed (marked with -)
# + Lines that were added (marked with +)
# Context lines around changes

Current file content:
${file.content.substring(0, 500)}${file.content.length > 500 ? '...' : ''}</code></pre>
        </div>
      </div>
    `;

    this.showGitModal('File Diff', content);
  }

  generateCommitId() {
    // Generate a Git-like commit hash
    const chars = 'abcdef0123456789';
    let result = '';
    for (let i = 0; i < 40; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  formatTime(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    return timestamp.toLocaleDateString();
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
      'txt': 'fas fa-file-alt'
    };
    return iconMap[ext] || 'fas fa-file';
  }

  showGitModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('gitModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'gitModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="gitModalTitle"></h2>
            <button class="modal-close" id="closeGitModal">&times;</button>
          </div>
          <div class="modal-body" id="gitModalContent"></div>
        </div>
      `;
      document.body.appendChild(modal);

      // Add close functionality
      document.getElementById('closeGitModal').addEventListener('click', () => {
        modal.style.display = 'none';
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }

    document.getElementById('gitModalTitle').textContent = title;
    document.getElementById('gitModalContent').innerHTML = content;
    modal.style.display = 'flex';
  }

  // Branch management methods
  createBranch(branchName) {
    if (this.repository.branches.includes(branchName)) {
      this.ide.addOutput(`❌ Branch '${branchName}' already exists`, 'stderr');
      return;
    }

    this.repository.branches.push(branchName);
    this.ide.addOutput(`🌿 Created branch: ${branchName}`, 'system');
  }

  switchBranch(branchName) {
    if (!this.repository.branches.includes(branchName)) {
      this.ide.addOutput(`❌ Branch '${branchName}' does not exist`, 'stderr');
      return;
    }

    this.repository.currentBranch = branchName;
    this.ide.addOutput(`🌿 Switched to branch: ${branchName}`, 'system');
  }

  mergeBranch(branchName) {
    if (branchName === this.repository.currentBranch) {
      this.ide.addOutput(`❌ Cannot merge branch '${branchName}' into itself`, 'stderr');
      return;
    }

    this.ide.addOutput(`🔀 Merged branch '${branchName}' into '${this.repository.currentBranch}'`, 'system');
  }

  getRepositoryStats() {
    return {
      totalCommits: this.repository.commits.length,
      totalBranches: this.repository.branches.length,
      modifiedFiles: this.repository.modifiedFiles.size,
      stagedFiles: this.repository.stagedFiles.size,
      currentBranch: this.repository.currentBranch
    };
  }
}