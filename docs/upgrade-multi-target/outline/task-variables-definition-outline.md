# **System Variables Definition**

## **`build-project` command definition**

- `cmd /c "C:/src/ControlPlane/tools/path1st/myenv.cmd && cd {{projectFolder}} && C:/src/ControlPlane/build/path1st/build.cmd"`.

## **`quick-build-project` definition **

- `cmd /c "C:/src/ControlPlane/tools/path1st/myenv.cmd && cd {{projectFolder}} && C:/.tools/QuickBuild/quickbuild.cmd -notest"`.

## **`project-issue-and-solution.md` Location**

- `C:/src/gemini-cli/docs/upgrade-multi-target/issue-and-solution/project-issue-and-solution.md`\*\*

## **`code-issue-and-solution.md` Location**

- `C:/src/gemini-cli/docs/upgrade-multi-target/issue-and-solution/code-issue-and-solution.md`

# Intruduction

- {{projectFolder}} MUST be replaced with the root directory of the target C#
  project.
- If the input is not a directory path, derive the folder path from it (e.g.,
  from a .csproj file, take its parent directory).
- Always keep the entire shell command inside one double-quoted string (").
- DO NOT use output redirection operators (such as >, >>, 2>&1). The output must
  appear in the console directly.
