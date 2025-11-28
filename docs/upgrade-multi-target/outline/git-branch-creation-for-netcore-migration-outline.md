# Task Outline: Git Branch Creation for .NET Core Migration

## Git User Name

- `v-wangjunf`

## **Step 1: Verify if the working directory is a Git repository**

- Check if the current directory is part of a Git repository. -If it is not,
  prompt the user to initialize a Git repository.

## **Step 2: Create a New Git Branch for .NET Core Migration**

- The new branch should follow the naming convention:
  `users/<git-user-name>/net_core_migration_<AssemblyName>` and based on master
  branch.
  - git-user-name should be the alias name of the Git user (without the email
    suffix).
  - `<AssemblyName>` can be derived by searching within the provided .csproj
    (the {{args}}) for the project's assembly name.

## **Step 2: Confirm Branch Creation and Switch On It**

- Once the branch is created, confirm that the user is switched to the new
  branch.
- Provide the user with the name of the new branch for verification.
