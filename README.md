# Fluxo.io

A new project with Husky and GitHub Actions setup for automated code quality, testing, and deployment.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize Husky:**
   ```bash
   npm run prepare
   ```

3. **Make your first commit:**
   ```bash
   git add .
   git commit -m "feat: initial project setup"
   ```

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Available Scripts

- `npm run prepare` - Initialize Husky git hooks
- `npm run dev` - Start development server (add your command)
- `npm run build` - Build the project (add your command)
- `npm run test` - Run tests (add your command)
- `npm run lint` - Run code linting (add your command)
- `npm run format` - Format code (add your command)
- `npm run type-check` - Run type checking (add your command)

## 🔧 Git Hooks (Husky)

This project uses Husky to manage Git hooks for code quality:

### Pre-commit Hook
- Runs `lint-staged` to check only staged files
- Ensures code formatting and linting before commits
- **Location:** `.husky/pre-commit`

### Pre-push Hook  
- Runs full test suite
- Builds the project to ensure everything compiles
- Lints the entire codebase
- **Location:** `.husky/pre-push`

### Commit Message Hook
- Validates commit message format (Conventional Commits)
- Ensures consistent commit history
- **Location:** `.husky/commit-msg`

## 🤖 GitHub Actions

### CI/CD Pipeline (`.github/workflows/ci.yml`)

Runs on every push and pull request:

1. **Lint and Format Check** - Code quality validation
2. **Run Tests** - Unit tests across multiple Node.js versions
3. **Build Application** - Compile and build the project
4. **Security Scan** - Vulnerability scanning with Trivy
5. **Deploy** - Automatic deployment to production (main branch only)
6. **Cleanup** - Clean up artifacts and caches

## 📝 How to Customize

### Adding Your Own Scripts

Update the `scripts` section in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
```

### Adding More Husky Hooks

1. **Create a new hook file:**
   ```bash
   touch .husky/post-commit
   chmod +x .husky/post-commit
   ```

2. **Add your custom logic:**
   ```bash
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"
   
   echo "Running post-commit tasks..."
   # Your custom commands here
   ```

3. **Available hook types:**
   - `pre-commit` - Before commit
   - `pre-push` - Before push
   - `commit-msg` - Validate commit message
   - `post-commit` - After commit
   - `pre-rebase` - Before rebase
   - `post-merge` - After merge

### Adding More GitHub Actions Steps

#### In CI Pipeline:

1. **Add a new job:**
   ```yaml
   new-job:
     name: 🆕 New Job
     runs-on: ubuntu-latest
     needs: [previous-job]
     
     steps:
     - name: Checkout code
       uses: actions/checkout@v4
     - name: Your custom step
       run: echo "Custom action"
   ```

2. **Add steps to existing jobs:**
   ```yaml
   - name: Your new step
     run: npm run your-script
   ```

#### Common Additions:

**Code Quality:**
```yaml
- name: Type checking
  run: npm run type-check

- name: Security audit
  run: npm audit --audit-level moderate

- name: Bundle size check
  run: npm run bundle-analyzer
```

**Testing:**
```yaml
- name: Integration tests
  run: npm run test:integration

- name: E2E tests
  run: npm run test:e2e

- name: Performance tests
  run: npm run test:performance
```

**Deployment:**
```yaml
- name: Deploy to staging
  run: npm run deploy:staging
  if: github.ref == 'refs/heads/develop'

- name: Deploy to production
  run: npm run deploy:production
  if: github.ref == 'refs/heads/main'
```

### Adding More Lint-staged Rules

Update `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix"
    ]
  }
}
```

## 🔐 Environment Variables

### Required Secrets (GitHub Repository Settings)

Add these in your GitHub repository settings under Settings → Secrets and variables → Actions:

- `NPM_TOKEN` - For publishing to npm
- `VERCEL_TOKEN` - For Vercel deployment
- `AWS_ACCESS_KEY_ID` - For AWS deployment
- `AWS_SECRET_ACCESS_KEY` - For AWS deployment
- `SLACK_WEBHOOK` - For Slack notifications

### Local Environment

Create a `.env` file for local development:
```bash
NODE_ENV=development
API_URL=http://localhost:3000
```

## 📚 Additional Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Lint-staged Documentation](https://github.com/okonet/lint-staged)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.