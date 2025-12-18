## 📦 Usage Guide

1. Download the following from the
   [Releases](https://github.com/wenbo97/gemini-cli/releases) page:
   - `net-upgrade-gemini-cli-<version>.tgz`
   - `gemini-docs-package.zip`

2. Move both files into a clean directory.

3. Install CLI:
   - First-time install:
     ```bash
     npm install -g net-upgrade-gemini-cli-<version>.tgz
     ```
   - Reinstall (overwrite):
     ```bash
     npm uninstall -g @net-upgrade/gemini-cli
     npm install -g net-upgrade-gemini-cli-<version>.tgz
     ```

4. Unzip `gemini-docs-package.zip`, then move the extracted `.gemini` folder to
   the parent directory.

5. Place your `settings.json` and `.env` files inside the `.gemini` directory
   and set your _GITHUB_TOKEN_ in `.env` file
   ```yaml
   GITHUB_TOKEN=<your-github-pat-token>
   ```

- Directory: ![workspace](docs\assets\gemini-workspace.png)
  ![secret](docs\assets\gemini-secret-files.png)

6. Open a **Command Prompt as Administrator**, navigate to the folder containing
   the `.tgz` and `.gemini` folders, then run:

   ```cmd
   gemini
   ```
