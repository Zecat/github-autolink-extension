# Github autolink extension

A web extension to automatically insert links in commits title / description and PR title in github website, with regex matching, to an external website.

## Installation

The extension is not yet published, manual installation required

### Firefox

Go to about:debugging > This Firefox > Load Temporary Add-on.. > select github-autolink-extension/manifest.json

### Chrome

extension > manage extension > Load unpack > Select github-autolink-extension/build-chrome

## Configuration

You need to provide:
- a regex with a group, e.g. #(\w+\d+) to match #REF123
- an external url to the group matched would be added to this url ex https://mytaskmanager/ref/ would result in the link https://mytaskmanager/ref/REF123
- a list of github project to match e.g Zecat/github-autolink-extension would match github project https://github.com/Zecat/github-autolink-extension