---
layout: post
title: Ruby Code Coverage with Multiple Test Runners
tags: [ruby, github-actions, codecov, continuous-integration, code-coverage]
---

In Ruby development, maintaining code quality across versions is crucial. This post demonstrates how to set up a workflow to test your code across versions and generate detailed coverage reports, keeping your project robust as Ruby evolves.

If you don’t already have a working setup for Ruby code coverage, I recommend checking out my [Ruby Code Coverage Setup Guide], where I explain how to configure coverage reports for different dependencies and runtimes via test runners.

### Prerequisites

These are the tools being used:
- [CodeCov] : A code coverage reporting and tracking tool.
- [GitHub Actions] : A CI/CD platform integrated with GitHub.

### Create a GitHub Actions Workflow

Let's create a GitHub Actions workflow for code coverage analysis and run the same job for different Ruby versions. This will be done by leveraging [GitHub Actions matrix strategies].

{% raw %}
```yaml
# coverage.yml
jobs:
  coverage:
    name: "Ruby ${{ matrix.ruby-version }}"
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        ruby-version: 
          - "2.7"
          - "3.0"
          - "3.1"
          - "3.2"
          - "3.3"
          - "head"
    
    steps:
      - uses: actions/checkout@v4

      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ matrix.ruby-version }}
          rubygems: 3.4.22 # last version to support Ruby 2.7
```
{% endraw %}

Next, we need to install the gems required for generating the coverage report as described in [Ruby Code Coverage setup guide].

{% raw %}
```yaml
# coverage.yml
jobs:
  coverage:
      # .. more

      - run: gem install rake rspec simplecov simplecov-html simplecov-cobertura
      - run: rake coverage:run

      - run: sudo apt install tree
      - run: tree -a coverage

      - uses: actions/upload-artifact@v4
        with:
          name: "coverage-ruby-${{ matrix.ruby-version }}"
          path: coverage/ruby-*
          include-hidden-files: true
          retention-days: 1
```
{% endraw %}

The `tree` command is included in the example for troubleshooting purposes. In the case of `Ruby 3.3`, we should see the following output after executing the `tree` command:
```
coverage
└── ruby-3.3.5
    ├── .last_run.json
    ├── .resultset.json
    ├── .resultset.json.lock
    └── coverage.xml

1 directory, 4 files
```

The coverage result from each Ruby version will be uploaded to [GitHub Actions Artifacts].
<figure>
  <img src="{{site.url}}/assets/screenshots/2024-09-15/code-coverage-artifacts.png" alt="Code Coverage Artifacts"/>
  <figcaption>Code Coverage results uploaded to CodeCov</figcaption>
</figure>

### Collate Coverage Reports from Test Runners

Next, we need to add another `report` job to collate the coverage results into a single coverage result.

{% raw %}
```yaml
# coverage.yml
jobs:
  # .. more

  report:
    name: "Report to CodeCov"
    needs: [coverage]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/download-artifact@v4
        with:
          pattern: coverage-ruby-*
          path: coverage-results
          merge-multiple: true

      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3"

      - run: gem install rake rspec simplecov simplecov-html simplecov-cobertura
      - run: rake coverage:report
        env:
          COV_DIR: coverage-results

      - run: sudo apt install tree
      - run: tree -a coverage-results
      - run: tree -a coverage
```
{% endraw %}

The outputs from the `tree` commands above should look something like:
```sh
tree -a coverage-results
```
```
coverage-results
├── ruby-2.7.8
│   ├── .last_run.json
│   ├── .resultset.json
│   ├── .resultset.json.lock
│   └── coverage.xml
├── ruby-3.0.7
│   ├── .last_run.json
│   ├── .resultset.json
│   ├── .resultset.json.lock
│   └── coverage.xml
├── ruby-3.1.6
│   ├── .last_run.json
│   ├── .resultset.json
│   ├── .resultset.json.lock
│   └── coverage.xml
├── ruby-3.2.5
│   ├── .last_run.json
│   ├── .resultset.json
│   ├── .resultset.json.lock
│   └── coverage.xml
├── ruby-3.3.5
│   ├── .last_run.json
│   ├── .resultset.json
│   ├── .resultset.json.lock
│   └── coverage.xml
└── ruby-3.4.0
    ├── .last_run.json
    ├── .resultset.json
    ├── .resultset.json.lock
    └── coverage.xml

6 directories, 24 files
```
```sh
tree -a coverage
```
```
coverage
├── .last_run.json
├── .resultset.json
├── .resultset.json.lock
└── coverage.xml

0 directories, 4 files
```

### Report to CodeCov

In the next step, we will pass the `coverage` directory (which contains the collated coverage result) to [CodeCov Action].

{% raw %}
```yaml
# coverage.yml
jobs:
  # .. more

  report:
    steps:
        # .. more

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          directory: coverage
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: true
```
{% endraw %}

### Report to CodeCov with Flags

Alternatively, if you want to leverage [CodeCov Flags] to have a better overview of the coverage result for each Ruby version, we could skip coverage result collation and upload individual coverage results to CodeCov with the corresponding flags.

{% raw %}
```yaml
# coverage.yml
jobs:
  # .. more

  report:
    name: "Report to CodeCov"
    needs: [coverage]
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        ruby-version: 
          - "2.7"
          - "3.0"
          - "3.1"
          - "3.2"
          - "3.3"
          - "head"

    steps:
      - uses: actions/checkout@v4

      - uses: actions/download-artifact@v4
        with:
          pattern: "coverage-ruby-${{ matrix.ruby-version }}*"
          path: coverage

      - run: sudo apt install tree
      - run: tree -a coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          directory: coverage
          token: ${{ secrets.CODECOV_TOKEN }}
          flags: "ruby-${{ matrix.ruby-version }}"
          fail_ci_if_error: true
```
{% endraw %}

In the modified `report` job, we've removed the need for `ruby-setup` to collate coverage results, and artifacts are now downloaded one at a time.

<figure>
  <img src="{{site.url}}/assets/screenshots/2024-09-15/code-coverage-codecov-flags.png" alt="CodeCov with flags"/>
  <figcaption>Code Coverage uploaded to CodeCov with flags</figcaption>
</figure>

The coverage report for each Ruby version remains around 91% due to the `if-else` statement on `RUBY_VERSION`.
<figure>
  <img src="{{site.url}}/assets/screenshots/2024-09-15/codecov-reporting-flags.png" alt="CodeCov Report for flags"/>
  <figcaption>CodeCov Report for flags</figcaption>
</figure>

However, the overall code coverage stays at 100% as the result of merging the individual coverage reports.
<figure>
  <img src="{{site.url}}/assets/screenshots/2024-09-15/codecov-reporting.png" alt="Overall CodeCov Report"/>
  <figcaption>Overall CodeCov Report</figcaption>
</figure>

[Ruby Code Coverage setup guide]: {% post_url 2024-09-08-ruby-code-coverage-for-backward-compatibility %}

[CodeCov]: https://codecov.io/
[CodeCov Action]: https://github.com/codecov/codecov-action
[CodeCov Flags]: https://docs.codecov.com/docs/flags

[GitHub Actions]: https://github.com/features/actions
[GitHub Actions matrix strategies]: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow
[GitHub Actions Artifacts]: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow