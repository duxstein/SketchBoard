# 🤝 Contributing to SketchBoard

Thank you for considering contributing to **SketchBoard**!  
This project thrives on open collaboration and the creativity of the community.  
Before you start, please read the following guidelines to ensure a smooth contribution process.

---

## 🧠 Philosophy

SketchBoard aims to be **an open, extensible, privacy-first collaborative whiteboard**.  
We welcome contributions that improve usability, performance, accessibility, and developer experience — regardless of your experience level.

---

## 🧰 Getting Started

1. **Fork** the repository on GitHub.  
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/SketchBoard.git
   cd SketchBoard
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Run locally**:
   ```bash
   pnpm dev
   ```
   The app should now be available at [http://localhost:5173](http://localhost:5173).

---

## 🧩 Branching Strategy

- **main** — stable production branch  
- **dev** — active development branch  
- **feature/*** — feature development branches (e.g., `feature/shape-tools`)  
- **fix/*** — bug fixes or hotfixes  

Before creating a pull request (PR), ensure your branch is **rebased** from `dev`.

---

## 🧪 Code Guidelines

- Write clean, readable, and well-commented TypeScript.
- Follow existing **linting rules** and run `pnpm lint` before committing.
- Prefer functional React components and hooks.
- Follow **conventional commits** (e.g., `feat: add pen tool`, `fix: canvas render issue`).
- Include relevant **unit tests** for new logic (Jest / Playwright).
- Avoid breaking backward compatibility.

---

## 🧱 Submitting a Pull Request

1. **Commit** and **push** your changes.
2. Open a **Pull Request** to the `dev` branch.
3. Fill out the PR template clearly describing:
   - What was added or fixed
   - Screenshots (if applicable)
   - Any related issue numbers (e.g., `Closes #42`)
4. Wait for a review — maintainers will provide feedback promptly.

---

## 🐛 Reporting Bugs

Found a bug?  
- Check if it’s already reported in [Issues](../../issues).  
- If not, open a **new issue** using the *Bug Report* template.  
- Include clear reproduction steps, expected behavior, and environment details.

---

## 🌟 Feature Requests

Have a cool idea or improvement?  
Open a **Feature Request** issue and describe your use case or problem clearly.  
Let’s discuss and design it together!

---

## 🧑‍🤝‍🧑 Community Contributions

Even non-code contributions are valuable:
- Documentation improvements
- UI/UX design proposals
- Accessibility audits
- Social promotion / educational content

---

## 💬 Need Help?

Join the conversation in [Discussions](../../discussions).  
We believe in constructive, respectful collaboration — no question is too small!

---

Thanks again for helping make **SketchBoard** better for everyone 💚
