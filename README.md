# qase-playwright

1. [Syntax Examples](syntax-examples)
2. [Frequently Asked Questions](frequently-asked-questions)


---

### Syntax Examples
This is an example repository with tests in the `tests/examples/` directory. To run the tests :

1. Clone the repository with `git clone https://github.com/cskmnrpt/qase-playwright.git`.

   To clone a different branch, other than `main`, use this command - 
   `git clone --single-branch --branch <branch-name> https://github.com/cskmnrpt/qase-playwright.git`.

2. Run `npm install` from the root of this repository to install dependencies.

3. Create a `qase.config.json` in the root of the repository, and add your token, and project code.

4. Run `npm test`.


---
### Frequently Asked Questions
1. Test cases are duplicated in the repository when using Playwright Projects. [[Read more]](./FAQ/projects-result-in-duplicate-cases.md)
2. For Test with `test.skip` and Qase ID defined, a new test case is created rather than linking the skipped results with the existing test cases. [[Read more]](./FAQ/Test.skip-creates-new-test-case.md)
