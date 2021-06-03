## Amazon Batch "Render Job Definition" Action for GitHub Actions

Inserts a container image URI into an Amazon Batch job definition JSON file, creating a new job definition file.

**Table of Contents**

<!-- toc -->

- [Usage](#usage)
- [License Summary](#license-summary)
- [Security Disclosures](#security-disclosures)

<!-- tocstop -->

## Usage

To insert the image URI `amazon/amazon-batch-sample:latest` as the image in the job definition file, and then register the edited task definition file to AWS batch:

```yaml
    - name: Render Amazon Batch job definition
      id: render-job-def
      uses: jon-evergreen/amazon-batch-render-job-definition@v1
      with:
        task-definition: job-definition.json
        image: amazon/amazon-batch-sample:latest

    - name: Register with Amazon Batch service
      uses: jon-evergreen/amazon-batch-register-job-definition@v1
      with:
        job-definition: ${{ steps.render-job-def.outputs.job-definition }}
```

See [action.yml](action.yml) for the full documentation for this action's inputs and outputs.

## License Summary

This code is made available under the MIT license.

## Security Disclosures

If you would like to report a potential security issue in this project, please do not create a GitHub issue.
