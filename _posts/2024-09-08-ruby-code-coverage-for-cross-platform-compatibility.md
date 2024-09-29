---
layout: post
title: Ruby Code Coverage with Rake, RSpec, SimpleCov for Cross-Platform Compatibility
tags: [ruby, simple-cov, rspec, rake, continuous-integration, code-coverage, cross-platform]
---

Code coverage in Ruby is pretty straightforward and easy to begin with, thanks to the amazing [SimpleCov](https://github.com/simplecov-ruby/simplecov) library, which has wide support for different testing frameworks.

Conventionally, when running code coverage for web applications, the primary aim is to examine line/branch coverage in a standardized machine environment, whether it is a server machine or a Docker container. Most of the time, we only test the current production environment or new OS or Runtime images for major updates.

However, for the case of a Ruby library or standalone application, it would be slightly different.

In this post, I will discuss my experience in maintaining a Ruby library for different Ruby versions, gem dependencies, and OS versions.

### Requirements

These are the libraries being used in this project:
- [SimpleCov](https://github.com/simplecov-ruby/simplecov): A code coverage analysis tool for Ruby
- [RSpec](https://github.com/rspec/rspec): A behavior-driven development framework for Ruby
- [Rake](https://github.com/ruby/rake): A Ruby build utility similar to Make

### Code using different Ruby APIs

For example, Ruby 3.1 introduced an improvement to the `File#dirname` method, allowing for parent directory retrieval with an optional level parameter. For more details, you can check the issue tracker at [Ruby Issue 12194](https://bugs.ruby-lang.org/issues/12194).

```rb
# lib/config.rb
class Config
  ROOT = if RUBY_VERSION >= "3.1"
           File.dirname(__FILE__, 2).freeze
         else
           File.expand_path(File.join(File.dirname(__FILE__), "..")).freeze
         end
end
```

### Write a Test with RSpec

Now write a RSpec test for `Config::ROOT`

```rb
# spec/config_spec.rb
require "pathname"
require_relative "../lib/config"
RSpec.describe Config do
  describe "ROOT" do
    subject { Config::ROOT }

    let(:root_dir) { Pathname.new(__dir__).parent.to_s }

    it { is_expected.to eq root_dir }
  end
end
```

### RSpec Execution Approaches

There are two ways to execute RSpec commands:
1. run `rspec` with CLI arguments. e.g. `rspec --require spec_helper --format documentation`.
2. run the RSpec rake task with preconfigured setup.

    > RSpec rake task will spawn child process to execute RSpec CLI with arguments.

### Create RSpec Rake Task

Let's add an RSpec rake task to simplify the command to run tests. This will become handy for code coverage later on.
```rb
# tasks/rspec.rake
require "rspec/core/rake_task"
RSpec::Core::RakeTask.new(:spec) do |config|
  config.rspec_opts = "--format documentation"
end
```
```rb
# Rakefile
Dir[File.expand_path("tasks/*.rake", __dir__)].each { |task| load task }
```

Now, run `rake --tasks` to see the rake tasks that have been configured.
```
rake spec             # Run RSpec code examples
```

When running the command `rake spec`, we will see the following output.
```
Config
  ROOT
    is expected to eq "/path/to/root"

Finished in 0.00058 seconds (files took 0.05219 seconds to load)
1 example, 0 failures
```

### Configure Code Coverage when Running RSpec

With RSpec set up sucessfully, we can proceed with code coverage configuration. For this step, we will use the centeralized configuration file, `.simplecov` to initialize `SimpleCov` whenever `require 'simplecov'` statement is called. 

Using the following configuration, the coverage report (`ruby-X.X.X` folder) will be generated in the folder specified by `ENV['COV_DIR']` or default to `coverage` folder in the current working directory.

```rb
# .simplecov
SimpleCov.configure do
  enable_coverage :branch
  command_name "ruby-#{RUBY_VERSION}"
  coverage_dir File.join(ENV.fetch("COV_DIR", "coverage"), command_name)

  if ENV["CI"]
    require "simplecov-cobertura"
    formatter SimpleCov::Formatter::CoberturaFormatter
  end
end
```

Now, let's create `coverage.rake` to run code coverage analysis through RSpec.
```rb
# tasks/coverage.rake
namespace :coverage do
  desc "Run coverage with spec"
  task :run do
    Rake::Task[:spec].invoke(coverage: true)
  end
end
```

We also need to modify RSpec rake task to start `SimpleCov` during rspec execution. 
```rb
# tasks/rspec.rake
require "rspec/core/rake_task"
RSpec::Core::RakeTask.new(:spec, [:coverage]) do |config, args|
  config.ruby_opts = "-r./.simplecov_spawn" if args[:coverage]
  config.rspec_opts = "--format documentation"
end
```

Using the [recommended apporach](https://github.com/simplecov-ruby/simplecov?#running-simplecov-against-spawned-subprocesses) to start `SimpleCov` for spawned subprocess. We are going to skip the step `SimpleCov.at_fork.call(Process.pid)` as the additional fork behavior is not required in this case.

```rb
# .simplecov_spawn.rb
require "simplecov"
SimpleCov.start
```

Now, run `rake --tasks` to see the updated rake tasks.
```
rake coverage:run     # Run coverage with spec
rake spec[coverage]   # Run RSpec code examples
```

When running the command `rake coverage:run` when `RUBY_VERSION` is `3.3.4`, we will see the following output.
```
Coverage report generated for ruby-3.3.4 to /path/to/root/coverage/ruby-3.3.4.
Line Coverage: 90.91% (10 / 11)
Branch Coverage: 50.0% (1 / 2)
```

Similar for `RUBY_VERSION 3.0.7`, we will see the same output.
```
Coverage report generated for ruby-3.0.7 to /path/to/root/coverage/ruby-3.0.7.
Line Coverage: 90.91% (10 / 11)
Branch Coverage: 50.0% (1 / 2)
```

However, the result is totally different.

<figure>
  <img src="{{site.url}}/assets/screenshots/2024-09-08/coverage-ruby-3.0.7.png" alt="Coverage Ruby 3.0.7"/>
  <figcaption>coverage/ruby-3.0.7/index.html</figcaption>
</figure>

<figure>
  <img src="{{site.url}}/assets/screenshots/2024-09-08/coverage-ruby-3.3.4.png" alt="Coverage Ruby 3.3.4"/>
  <figcaption>coverage/ruby-3.3.4/index.html</figcaption>
</figure>


### Collate Multiple Reports into a Unified Coverage Report

Finally, we will add another rake task `coverage:report` to collate the coverage results into a single coverage report.
```rb
# tasks/coverage.rake
namespace :coverage do
  desc "Run coverage with spec"
  task :run do
    Rake::Task[:spec].invoke(coverage: true)
  end

  desc "Collate coverage results generated by different test runners"
  task :report do
    require "simplecov"
    coverage_dir = File.join(File.dirname(SimpleCov.coverage_dir), "ruby-*")
    coverage_results = Dir[File.join(coverage_dir, ".resultset.json")]

    raise <<~MSG if coverage_results.empty?
      Coverage results not found, searched in:
      #{Dir[coverage_dir].map { |dir| "  - #{dir}" }.join("\n")}
    MSG

    SimpleCov.collate(coverage_results) do
      coverage_dir "coverage"
    end
  end
end

desc "Run coverage analysis and collate coverage results"
task coverage: ["coverage:run", "coverage:report"]
```

Now, run `rake --tasks` to see the updated rake tasks.
```
rake coverage         # Run coverage analysis and collate coverage results
rake coverage:report  # Collate coverage results generated by different test runners
rake coverage:run     # Run coverage with spec
rake spec[coverage]   # Run RSpec code examples
```

When running the command `rake coverage:report` and we will see the following output.
```
Coverage report generated for ruby-3.0.7, ruby-3.3.4 to /path/to/root/coverage.
Line Coverage: 100.0% (11 / 11)
Branch Coverage: 100.0% (2 / 2)
```

<figure>
  <img src="{{site.url}}/assets/screenshots/2024-09-08/coverage-collated.png" alt="Collated Coverage"/>
  <figcaption>coverage/index.html</figcaption>
</figure>

The final project structure looks like this:
```
├── coverage
│   ├── ruby-3.0.7
│   │   ├── assets
│   │   ├── .resultset.json
│   │   ├── index.html
│   │   └── coverage.xml # when CoberturaFormatter is enabled
│   ├── ruby-3.3.4
│   │   ├── assets
│   │   ├── .resultset.json
│   │   ├── index.html
│   │   └── coverage.xml # when CoberturaFormatter is enabled
│   ├── assets
│   ├── .resultset.json
│   ├── index.html
│   └── coverage.xml # when CoberturaFormatter is enabled
├── lib
│   └── config.rb
├── spec
│   └── config_spec.rb
├── tasks
│   ├── coverage.rake
│   └── rspec.rake
├── .simplecov
├── .simplecov_spawn.rb
└── Rakefile
```