class FileManager {
  constructor(ideCore) {
    this.ide = ideCore;
    this.setupFileInput();
  }

  setupFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
      this.handleFileUpload(e.target.files);
    });
  }

  async handleFileUpload(files) {
    for (const file of files) {
      try {
        const content = await this.readFileContent(file);
        const language = this.detectLanguage(file.name);
        
        this.ide.project.files.set(file.name, {
          content: content,
          language: language,
          modified: false,
          created: new Date(),
          size: file.size
        });
        
        this.ide.addOutput(`Uploaded: ${file.name} (${this.formatFileSize(file.size)})`, 'system');
      } catch (error) {
        this.ide.addOutput(`Failed to upload ${file.name}: ${error.message}`, 'stderr');
      }
    }
    
    this.ide.updateFileTree();
  }

  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  detectLanguage(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const languageMap = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'sql': 'sql',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'txt': 'plaintext'
    };
    return languageMap[ext] || 'plaintext';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  createNewFile() {
    const fileName = prompt('Enter file name:', 'new_file.py');
    if (!fileName) return;

    if (this.ide.project.files.has(fileName)) {
      alert('File already exists!');
      return;
    }

    const language = this.detectLanguage(fileName);
    const template = this.getFileTemplate(language);
    
    this.ide.project.files.set(fileName, {
      content: template,
      language: language,
      modified: false,
      created: new Date(),
      size: template.length
    });

    this.ide.updateFileTree();
    this.ide.openFile(fileName);
    this.ide.addOutput(`Created new file: ${fileName}`, 'system');
  }

  getFileTemplate(language) {
    const templates = {
      python: `#!/usr/bin/env python3
"""
New Python file
"""

def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()
`,
      javascript: `// New JavaScript file

function main() {
    console.log("Hello, World!");
}

main();
`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
`,
      css: `/* New CSS file */

body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
}

h1 {
    color: #333;
}
`,
      markdown: `# New Document

This is a new markdown document.

## Getting Started

Write your content here...
`,
      json: `{
    "name": "new-project",
    "version": "1.0.0",
    "description": ""
}
`
    };

    return templates[language] || '// New file\n';
  }

  saveFile(fileName) {
    const file = this.ide.project.files.get(fileName);
    if (!file) return;

    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.ide.addOutput(`Downloaded: ${fileName}`, 'system');
  }

  saveAllFiles() {
    const zip = new JSZip();
    
    this.ide.project.files.forEach((file, fileName) => {
      zip.file(fileName, file.content);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.ide.project.name}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    this.ide.addOutput(`Downloaded project: ${this.ide.project.name}.zip`, 'system');
  }

  deleteFile(fileName) {
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
      this.ide.project.files.delete(fileName);
      this.ide.closeTab(fileName);
      this.ide.updateFileTree();
      this.ide.addOutput(`Deleted: ${fileName}`, 'system');
    }
  }

  renameFile(oldName, newName) {
    if (this.ide.project.files.has(newName)) {
      alert('File with this name already exists!');
      return false;
    }

    const file = this.ide.project.files.get(oldName);
    if (!file) return false;

    this.ide.project.files.delete(oldName);
    this.ide.project.files.set(newName, {
      ...file,
      language: this.detectLanguage(newName)
    });

    // Update editor if file is open
    if (this.ide.editors.has(oldName)) {
      const editor = this.ide.editors.get(oldName);
      this.ide.editors.delete(oldName);
      this.ide.editors.set(newName, editor);
      
      // Update tab
      const tab = document.querySelector(`[data-file="${oldName}"]`);
      if (tab) {
        tab.setAttribute('data-file', newName);
        tab.querySelector('span').textContent = newName;
      }
    }

    this.ide.updateFileTree();
    this.ide.addOutput(`Renamed: ${oldName} → ${newName}`, 'system');
    return true;
  }

  searchInFiles(query) {
    const results = [];
    
    this.ide.project.files.forEach((file, fileName) => {
      const lines = file.content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            fileName,
            lineNumber: index + 1,
            lineContent: line.trim(),
            matchIndex: line.toLowerCase().indexOf(query.toLowerCase())
          });
        }
      });
    });

    return results;
  }

  replaceInFiles(searchQuery, replaceWith, filePattern = '*') {
    let replacements = 0;
    
    this.ide.project.files.forEach((file, fileName) => {
      if (filePattern === '*' || fileName.includes(filePattern)) {
        const originalContent = file.content;
        const newContent = originalContent.replace(
          new RegExp(searchQuery, 'g'), 
          replaceWith
        );
        
        if (originalContent !== newContent) {
          file.content = newContent;
          file.modified = true;
          
          // Update editor if file is open
          const editor = this.ide.editors.get(fileName);
          if (editor) {
            editor.setValue(newContent);
          }
          
          const matches = (originalContent.match(new RegExp(searchQuery, 'g')) || []).length;
          replacements += matches;
        }
      }
    });

    this.ide.updateFileTree();
    this.ide.addOutput(`Replaced ${replacements} occurrences of "${searchQuery}" with "${replaceWith}"`, 'system');
    return replacements;
  }

  createFolder(folderName) {
    // For simplicity, we'll represent folders as a prefix in file names
    this.ide.addOutput(`Created folder: ${folderName}`, 'system');
    // In a real implementation, you'd need a more sophisticated folder structure
  }

  exportProject() {
    const projectData = {
      name: this.ide.project.name,
      created: new Date(),
      files: {}
    };

    this.ide.project.files.forEach((file, fileName) => {
      projectData.files[fileName] = {
        content: file.content,
        language: file.language,
        created: file.created,
        modified: file.modified
      };
    });

    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.ide.project.name}-project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.ide.addOutput(`Exported project as JSON`, 'system');
  }

  importProject(projectFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);
          
          // Clear current project
          this.ide.project.files.clear();
          this.ide.editors.forEach(editor => editor.dispose());
          this.ide.editors.clear();
          
          // Load project data
          this.ide.project.name = projectData.name || 'Imported Project';
          
          Object.entries(projectData.files).forEach(([fileName, fileData]) => {
            this.ide.project.files.set(fileName, {
              content: fileData.content,
              language: fileData.language || this.detectLanguage(fileName),
              modified: false,
              created: new Date(fileData.created) || new Date()
            });
          });

          this.ide.updateFileTree();
          this.ide.addOutput(`Imported project: ${this.ide.project.name}`, 'system');
          resolve();
        } catch (error) {
          this.ide.addOutput(`Failed to import project: ${error.message}`, 'stderr');
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(projectFile);
    });
  }

  getFileStats() {
    let totalFiles = 0;
    let totalLines = 0;
    let totalSize = 0;
    const languageStats = {};

    this.ide.project.files.forEach((file, fileName) => {
      totalFiles++;
      totalLines += file.content.split('\n').length;
      totalSize += file.content.length;
      
      const lang = file.language || 'unknown';
      if (!languageStats[lang]) {
        languageStats[lang] = { files: 0, lines: 0 };
      }
      languageStats[lang].files++;
      languageStats[lang].lines += file.content.split('\n').length;
    });

    return {
      totalFiles,
      totalLines,
      totalSize,
      languageStats
    };
  }
}