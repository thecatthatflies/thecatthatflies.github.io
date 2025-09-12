class PackageManager {
  constructor(ideCore) {
    this.ide = ideCore;
    this.installedPackages = new Set(['numpy', 'matplotlib', 'micropip']);
    this.popularPackages = this.initializePopularPackages();
    this.setupPackageUI();
  }

  initializePopularPackages() {
    return [
      {
        name: 'requests',
        version: '2.31.0',
        description: 'HTTP library for Python',
        category: 'web',
        downloads: '500M+',
        status: 'available'
      },
      {
        name: 'beautifulsoup4',
        version: '4.12.2',
        description: 'Screen scraping library',
        category: 'web',
        downloads: '100M+',
        status: 'available'
      },
      {
        name: 'pandas',
        version: '2.0.3',
        description: 'Data analysis and manipulation',
        category: 'data-science',
        downloads: '200M+',
        status: 'available'
      },
      {
        name: 'pillow',
        version: '10.0.0',
        description: 'Image processing library',
        category: 'graphics',
        downloads: '150M+',
        status: 'installed'
      },
      {
        name: 'scikit-learn',
        version: '1.3.0',
        description: 'Machine learning library',
        category: 'data-science',
        downloads: '80M+',
        status: 'available'
      },
      {
        name: 'flask',
        version: '2.3.3',
        description: 'Micro web framework',
        category: 'web',
        downloads: '120M+',
        status: 'available'
      },
      {
        name: 'pytest',
        version: '7.4.0',
        description: 'Testing framework',
        category: 'testing',
        downloads: '90M+',
        status: 'available'
      },
      {
        name: 'selenium',
        version: '4.11.2',
        description: 'Web browser automation',
        category: 'web',
        downloads: '70M+',
        status: 'available'
      }
    ];
  }

  setupPackageUI() {
    this.updateInstalledPackages();
    this.updatePopularPackages();
    this.setupSearchFunctionality();
  }

  updateInstalledPackages() {
    const container = document.getElementById('installedPackages');
    container.innerHTML = '';

    this.installedPackages.forEach(packageName => {
      const packageDiv = document.createElement('div');
      packageDiv.className = 'package-item installed';
      packageDiv.innerHTML = `
        <div class="package-info">
          <div class="package-name">${packageName}</div>
          <div class="package-version">installed</div>
        </div>
        <div class="package-actions">
          <button class="package-btn uninstall" data-package="${packageName}">
            <i class="fas fa-trash"></i> Remove
          </button>
          <button class="package-btn info" data-package="${packageName}">
            <i class="fas fa-info-circle"></i>
          </button>
        </div>
      `;

      // Add event listeners
      const uninstallBtn = packageDiv.querySelector('.uninstall');
      const infoBtn = packageDiv.querySelector('.info');

      uninstallBtn.addEventListener('click', () => {
        this.uninstallPackage(packageName);
      });

      infoBtn.addEventListener('click', () => {
        this.showPackageInfo(packageName);
      });

      container.appendChild(packageDiv);
    });
  }

  updatePopularPackages() {
    const container = document.getElementById('popularPackages');
    container.innerHTML = '';

    this.popularPackages.forEach(pkg => {
      const isInstalled = this.installedPackages.has(pkg.name);
      const packageDiv = document.createElement('div');
      packageDiv.className = `package-item ${pkg.status}`;
      packageDiv.innerHTML = `
        <div class="package-info">
          <div class="package-header">
            <div class="package-name">${pkg.name}</div>
            <div class="package-category ${pkg.category}">${pkg.category}</div>
          </div>
          <div class="package-meta">
            <span class="package-version">v${pkg.version}</span>
            <span class="package-downloads">${pkg.downloads}</span>
          </div>
          <div class="package-description">${pkg.description}</div>
        </div>
        <div class="package-actions">
          ${isInstalled ? 
            '<button class="package-btn installed" disabled><i class="fas fa-check"></i> Installed</button>' :
            `<button class="package-btn install" data-package="${pkg.name}"><i class="fas fa-download"></i> Install</button>`
          }
          <button class="package-btn info" data-package="${pkg.name}">
            <i class="fas fa-info-circle"></i>
          </button>
        </div>
      `;

      // Add event listeners
      const installBtn = packageDiv.querySelector('.install');
      const infoBtn = packageDiv.querySelector('.info');

      if (installBtn) {
        installBtn.addEventListener('click', () => {
          this.installPackage(pkg.name);
        });
      }

      infoBtn.addEventListener('click', () => {
        this.showPackageInfo(pkg.name, pkg);
      });

      container.appendChild(packageDiv);
    });
  }

  setupSearchFunctionality() {
    const searchInput = document.getElementById('packageSearch');
    const searchBtn = document.getElementById('searchPackages');

    const performSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      this.searchPackages(query);
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });

    // Real-time search
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      this.filterPackages(query);
    });
  }

  async installPackage(packageName) {
    this.ide.addOutput(`Installing package: ${packageName}...`, 'system');
    this.ide.updateStatus('Installing package...', 'running');

    try {
      // Simulate package installation
      await this.simulatePackageInstall(packageName);

      // Actually try to install using micropip
      if (this.ide.pyodide) {
        const pip = this.ide.pyodide.pyimport('micropip');
        await pip.install(packageName);
      }

      this.installedPackages.add(packageName);
      this.updateInstalledPackages();
      this.updatePopularPackages();

      this.ide.addOutput(`✅ Successfully installed ${packageName}`, 'system');
      this.ide.updateStatus('Ready', 'ready');

      // Show usage example
      this.showPackageUsageExample(packageName);

    } catch (error) {
      this.ide.addOutput(`❌ Failed to install ${packageName}: ${error.message}`, 'stderr');
      this.ide.updateStatus('Installation failed', 'error');
    }
  }

  async simulatePackageInstall(packageName) {
    // Simulate installation time
    return new Promise(resolve => {
      const steps = [
        `Collecting ${packageName}...`,
        `Downloading ${packageName}...`,
        `Installing collected packages: ${packageName}`,
        `Successfully installed ${packageName}`
      ];

      let step = 0;
      const interval = setInterval(() => {
        if (step < steps.length) {
          this.ide.addOutput(`  ${steps[step]}`, 'system');
          step++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 800);
    });
  }

  uninstallPackage(packageName) {
    // Prevent uninstalling core packages
    const corePackages = ['numpy', 'matplotlib', 'micropip'];
    if (corePackages.includes(packageName)) {
      this.ide.addOutput(`❌ Cannot uninstall core package: ${packageName}`, 'stderr');
      return;
    }

    if (confirm(`Are you sure you want to uninstall ${packageName}?`)) {
      this.installedPackages.delete(packageName);
      this.updateInstalledPackages();
      this.updatePopularPackages();
      this.ide.addOutput(`🗑️ Uninstalled ${packageName}`, 'system');
    }
  }

  showPackageInfo(packageName, packageData) {
    const pkg = packageData || this.popularPackages.find(p => p.name === packageName);
    
    let infoContent = `
      <h3>${packageName}</h3>
      <p><strong>Status:</strong> ${this.installedPackages.has(packageName) ? 'Installed' : 'Available'}</p>
    `;

    if (pkg) {
      infoContent += `
        <p><strong>Version:</strong> ${pkg.version}</p>
        <p><strong>Category:</strong> ${pkg.category}</p>
        <p><strong>Downloads:</strong> ${pkg.downloads}</p>
        <p><strong>Description:</strong> ${pkg.description}</p>
      `;
    }

    // Show usage examples
    const examples = this.getPackageExamples(packageName);
    if (examples) {
      infoContent += `<h4>Usage Example:</h4><pre><code>${examples}</code></pre>`;
    }

    this.showModal('Package Information', infoContent);
  }

  getPackageExamples(packageName) {
    const examples = {
      'requests': `import requests

# GET request
response = requests.get('https://api.example.com/data')
print(response.json())

# POST request
data = {'key': 'value'}
response = requests.post('https://api.example.com/submit', json=data)`,

      'beautifulsoup4': `from bs4 import BeautifulSoup
import requests

# Parse HTML
html = "<html><body><h1>Hello World</h1></body></html>"
soup = BeautifulSoup(html, 'html.parser')
print(soup.find('h1').text)`,

      'pandas': `import pandas as pd

# Create DataFrame
data = {'name': ['Alice', 'Bob'], 'age': [25, 30]}
df = pd.DataFrame(data)
print(df.head())

# Read CSV
# df = pd.read_csv('data.csv')`,

      'flask': `from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

# app.run() # Uncomment to run`,

      'pillow': `from PIL import Image

# Create a new image
img = Image.new('RGB', (100, 100), color='red')
img.save('test.png')

# Open and resize
# img = Image.open('photo.jpg')
# img.resize((200, 200)).save('resized.jpg')`,

      'pytest': `# test_example.py
def test_addition():
    assert 2 + 2 == 4

def test_string():
    assert "hello".upper() == "HELLO"

# Run with: pytest test_example.py`,

      'selenium': `from selenium import webdriver
from selenium.webdriver.common.by import By

# Note: Requires browser driver setup
# driver = webdriver.Chrome()
# driver.get('https://example.com')
# element = driver.find_element(By.TAG_NAME, 'h1')
# print(element.text)`,

      'scikit-learn': `from sklearn.linear_model import LinearRegression
import numpy as np

# Simple linear regression
X = np.array([[1], [2], [3], [4]])
y = np.array([2, 4, 6, 8])

model = LinearRegression()
model.fit(X, y)
prediction = model.predict([[5]])
print(f"Prediction for 5: {prediction[0]}")`
    };

    return examples[packageName];
  }

  showPackageUsageExample(packageName) {
    const example = this.getPackageExamples(packageName);
    if (example) {
      const fileName = `${packageName}_example.py`;
      this.ide.project.files.set(fileName, {
        content: `# ${packageName} Usage Example
# Package installed successfully!

${example}

# Try running this code to see ${packageName} in action!
print(f"${packageName} is ready to use! 🎉")`,
        language: 'python',
        modified: false,
        created: new Date()
      });

      this.ide.updateFileTree();
      this.ide.addOutput(`📝 Created example file: ${fileName}`, 'system');
    }
  }

  searchPackages(query) {
    if (!query) {
      this.updatePopularPackages();
      return;
    }

    this.ide.addOutput(`🔍 Searching for packages: "${query}"...`, 'system');

    // Simulate package search
    const searchResults = this.popularPackages.filter(pkg => 
      pkg.name.toLowerCase().includes(query) ||
      pkg.description.toLowerCase().includes(query) ||
      pkg.category.toLowerCase().includes(query)
    );

    // Add some simulated search results
    const simulatedResults = [
      {
        name: `${query}-helper`,
        version: '1.0.0',
        description: `Helper utilities for ${query}`,
        category: 'utility',
        downloads: '10K+',
        status: 'available'
      },
      {
        name: `python-${query}`,
        version: '2.1.0', 
        description: `Python library for ${query} operations`,
        category: 'library',
        downloads: '25K+',
        status: 'available'
      }
    ];

    const combinedResults = [...searchResults, ...simulatedResults];

    this.displaySearchResults(combinedResults, query);
  }

  filterPackages(query) {
    const packageItems = document.querySelectorAll('#popularPackages .package-item');
    
    packageItems.forEach(item => {
      const name = item.querySelector('.package-name').textContent.toLowerCase();
      const description = item.querySelector('.package-description').textContent.toLowerCase();
      
      if (name.includes(query) || description.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  displaySearchResults(results, query) {
    const container = document.getElementById('popularPackages');
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search"></i>
          <h3>No packages found</h3>
          <p>No packages match "${query}". Try a different search term.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="search-results-header">
        <h4>Search results for "${query}" (${results.length} found)</h4>
        <button class="btn-outline" id="clearSearch">
          <i class="fas fa-times"></i> Clear Search
        </button>
      </div>
    `;

    document.getElementById('clearSearch').addEventListener('click', () => {
      document.getElementById('packageSearch').value = '';
      this.updatePopularPackages();
    });

    results.forEach(pkg => {
      const isInstalled = this.installedPackages.has(pkg.name);
      const packageDiv = document.createElement('div');
      packageDiv.className = `package-item ${pkg.status}`;
      packageDiv.innerHTML = `
        <div class="package-info">
          <div class="package-header">
            <div class="package-name">${pkg.name}</div>
            <div class="package-category ${pkg.category}">${pkg.category}</div>
          </div>
          <div class="package-meta">
            <span class="package-version">v${pkg.version}</span>
            <span class="package-downloads">${pkg.downloads}</span>
          </div>
          <div class="package-description">${pkg.description}</div>
        </div>
        <div class="package-actions">
          ${isInstalled ? 
            '<button class="package-btn installed" disabled><i class="fas fa-check"></i> Installed</button>' :
            `<button class="package-btn install" data-package="${pkg.name}"><i class="fas fa-download"></i> Install</button>`
          }
        </div>
      `;

      const installBtn = packageDiv.querySelector('.install');
      if (installBtn) {
        installBtn.addEventListener('click', () => {
          this.installPackage(pkg.name);
        });
      }

      container.appendChild(packageDiv);
    });
  }

  showModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('packageInfoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'packageInfoModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="modalTitle"></h2>
            <button class="modal-close" id="closePackageInfo">&times;</button>
          </div>
          <div class="modal-body" id="modalContent"></div>
        </div>
      `;
      document.body.appendChild(modal);

      // Add close functionality
      document.getElementById('closePackageInfo').addEventListener('click', () => {
        modal.style.display = 'none';
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').innerHTML = content;
    modal.style.display = 'flex';
  }

  generateRequirementsTxt() {
    let requirements = '';
    this.installedPackages.forEach(pkg => {
      const pkgInfo = this.popularPackages.find(p => p.name === pkg);
      const version = pkgInfo ? pkgInfo.version : 'latest';
      requirements += `${pkg}>=${version}\n`;
    });

    const fileName = 'requirements.txt';
    this.ide.project.files.set(fileName, {
      content: requirements.trim() || '# No packages installed',
      language: 'text',
      modified: false,
      created: new Date()
    });

    this.ide.updateFileTree();
    this.ide.addOutput(`📋 Generated ${fileName}`, 'system');
  }

  installFromRequirements(requirementsContent) {
    const lines = requirementsContent.split('\n');
    const packages = lines
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => line.split('>=')[0].split('==')[0].trim());

    this.ide.addOutput(`📦 Installing ${packages.length} packages from requirements...`, 'system');

    packages.forEach(async (pkg, index) => {
      setTimeout(() => {
        this.installPackage(pkg);
      }, index * 1000); // Stagger installations
    });
  }
}