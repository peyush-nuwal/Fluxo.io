# 🚀 Setup Guide: Husky + GitHub Actions

## ✅ What's Been Set Up

Your project now has a complete development workflow with:

### 🔧 Husky Git Hooks
- **Pre-commit**: Runs lint-staged to check staged files
- **Pre-push**: Runs full test suite and build
- **Commit-msg**: Validates commit message format (Conventional Commits)

### 🤖 GitHub Actions Workflows
- **CI/CD Pipeline** (`.github/workflows/ci.yml`): Runs on every push/PR
- **Release Workflow** (`.github/workflows/release.yml`): Handles automated releases

### 📦 Package Configuration
- `package.json` with all necessary scripts and dependencies
- `lint-staged` configuration for efficient code checking
- Comprehensive `.gitignore` file

## 🎯 Next Steps

### 1. Connect to GitHub Repository
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/fluxo.io.git

# Push your code
git push -u origin main
```

### 2. Configure GitHub Repository Settings

#### Enable GitHub Actions
- Go to your repository → Settings → Actions → General
- Ensure "Allow all actions and reusable workflows" is selected

#### Set up Environment Variables (Secrets)
Go to Settings → Secrets and variables → Actions, add:
- `NPM_TOKEN` (if publishing to npm)
- `VERCEL_TOKEN` (if using Vercel)
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` (if using AWS)
- `SLACK_WEBHOOK` (for notifications)

### 3. Customize for Your Project

#### Update Package Scripts
Edit `package.json` to match your project's actual scripts:
```json
{
  "scripts": {
    "lint": "eslint src/",
    "test": "jest",
    "build": "webpack --mode production",
    "format": "prettier --write src/"
  }
}
```

#### Add Real Linting Tools
```bash
# Install ESLint and Prettier
npm install --save-dev eslint prettier eslint-config-prettier

# Install testing framework
npm install --save-dev jest @testing-library/react
```

#### Configure Lint-staged
Update the `lint-staged` section in `package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

## 🔄 How to Add More Steps

### Adding More Husky Hooks

1. **Create a new hook:**
   ```bash
   touch .husky/post-commit
   chmod +x .husky/post-commit
   ```

2. **Add your logic:**
   ```bash
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"
   
   echo "Running post-commit tasks..."
   npm run update-docs
   npm run notify-team
   ```

### Adding More GitHub Actions Jobs

#### Example: Add a Performance Testing Job
```yaml
# Add to .github/workflows/ci.yml
performance-test:
  name: ⚡ Performance Tests
  runs-on: ubuntu-latest
  needs: [build]
  
  steps:
  - name: Checkout code
    uses: actions/checkout@v4
    
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '18'
      cache: 'npm'
      
  - name: Install dependencies
    run: npm ci
    
  - name: Run performance tests
    run: npm run test:performance
    
  - name: Upload performance results
    uses: actions/upload-artifact@v3
    with:
      name: performance-results
      path: performance-results/
```

#### Example: Add Database Testing
```yaml
database-test:
  name: 🗄️ Database Tests
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:13
      env:
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: test_db
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
      ports:
        - 5432:5432
        
  steps:
  - name: Checkout code
    uses: actions/checkout@v4
    
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '18'
      cache: 'npm'
      
  - name: Install dependencies
    run: npm ci
    
  - name: Run database tests
    run: npm run test:database
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
```

### Adding More Lint-staged Rules

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "npm run type-check"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.{py}": [
      "black",
      "flake8"
    ]
  }
}
```

## 🎨 Customization Examples

### Custom Pre-commit Hook
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running custom pre-commit checks..."

# Check for TODO comments
if git diff --cached --name-only | xargs grep -l "TODO\|FIXME"; then
  echo "❌ Found TODO/FIXME comments in staged files!"
  echo "Please remove or move them to issues before committing."
  exit 1
fi

# Check file sizes
git diff --cached --name-only | while read file; do
  if [ -f "$file" ] && [ $(wc -c < "$file") -gt 1000000 ]; then
    echo "❌ File $file is larger than 1MB!"
    exit 1
  fi
done

# Run security check
npm audit --audit-level moderate

echo "✅ Custom pre-commit checks passed!"
```

### Custom GitHub Actions Step
```yaml
- name: Check for security vulnerabilities
  run: |
    npm audit --audit-level high
    if [ $? -ne 0 ]; then
      echo "❌ High severity vulnerabilities found!"
      exit 1
    fi

- name: Check bundle size
  run: |
    npm run build
    SIZE=$(du -sh dist/ | cut -f1)
    echo "Bundle size: $SIZE"
    if [ "$SIZE" > "5M" ]; then
      echo "❌ Bundle size exceeds 5MB!"
      exit 1
    fi
```

## 🚨 Troubleshooting

### Common Issues

1. **Husky hooks not running:**
   ```bash
   # Reinstall Husky
   npm run prepare
   ```

2. **GitHub Actions not triggering:**
   - Check if Actions are enabled in repository settings
   - Ensure workflow files are in `.github/workflows/`
   - Check the `on:` trigger conditions

3. **Lint-staged not working:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Commit message validation failing:**
   - Use conventional commit format: `type: description`
   - Examples: `feat: add new feature`, `fix: resolve bug`

## 📚 Additional Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Lint-staged Documentation](https://github.com/okonet/lint-staged)

## 🎉 You're All Set!

Your project now has a professional development workflow. Every commit will be automatically checked for quality, and every push will trigger comprehensive CI/CD pipelines.

Happy coding! 🚀
