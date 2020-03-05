# Contributing to Polygon-Views

---

This document contains a set of guidelines to help you during the contribution
process.
Please review it in order to ensure a fast and effective response from the
maintainers.

## General questions

For general questions you can look the [documentation]
to learn more about the library and find some examples. If you have questions which are not
covered by the documentation, please contact one of the maintainers:

## Submitting contributions

We are glad to receive code contributions in the form of patches, improvements
and new features.
Below you will find the process and workflow used to review and merge your
changes.

### Step 0: Preparing the contribution

If you want to contribute a new feature or code improvement, contact one of the
maintainers first and discuss your approach.

### Step 1: Branch

Create a new branch from `develop` and choose an name which describes your contribution.

```sh
git checkout -b contribution-name
```

### Step 2: Code

-   **Document your changes**: Add or update the relevant entries for your change
    in the documentation to reflect your work and inform the users about it.

-   **Add unit tests**: If you add or modify functionality, it must include unit
    tests. Prefer snapshot-tests when no logic is included.

### Step 3: Commit

Try to commit as often as you can, keeping your changes logically grouped
within individual commits.
Generally it's easier to review changes that are split across multiple commits.

```sh
git add changed-file-1 changed-file-2
git commit
```

A good commit message should describe what changed and why.
Follow these guidelines when writing one:

1. Use the imperative, present tense: "change" not "changed" nor "changes"
1. The first line should contain a short description of the change in 50
   characters or less.
1. Do not end the description with a dot
1. The description must be in lowercase
1. Use the format `<type>(<scope>): <subject>`, where scope is optional and
   refers to the subsystem changed and type could be:
    - **chore**: Changes to the build process or auxiliary tools and libraries
      such as documentation generation
    - **docs**: Documentation only changes
    - **feat**: A new feature
    - **fix**: A bug fix
    - **refactor**: A code change that neither fixes a bug nor adds a feature
    - **style**: Changes that do not affect the meaning of the code
      (white-space, formatting, missing semi-colons, etc)
    - **test**: Adding missing or correcting existing tests
1. Keep the second line blank
1. If necessary, use the rest of the message to explain the change in detail
1. Wrap the message's body at 72 columns

### Step 4: Rebase

Rebase your branch to include the latest work on your branch.

```sh
git fetch origin
git rebase -i origin/develop
```

In case a conflict occurs, please resolve it and then use the following
command to continue with the rebase.

```sh
git rebase --continue
```

### Step 5: Test

Bug fixes and features should have tests and not break tested code.
Run the test suite and make sure all tests pass.
Run the linter to verify your code follows the coding style and conventions.
Please do not submit changes that fail either check.

```sh
npm run test
npm run lint
```

### Step 6: Push

When your work is ready and complies with the project conventions,
upload your changes to your fork:

```sh
git push origin <branch-name>
```

### Step 7: Pull request

Open a new Pull Request from your working branch to `develop`.
Write about the changes and add any relevant information to the reviewer.

### Step 8: Review and approval

When the changes have been approved, you can merge the changes to `develop`.
The release will be performed by the maintainers.
