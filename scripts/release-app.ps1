param(
  [Parameter(Mandatory = $true)]
  [string]$Version,

  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

if ($Version -notmatch '^\d+\.\d+\.\d+$') {
  throw "Version must be in semver format, for example 1.2.0"
}

$tagName = "app-v$Version"

Write-Host "Preparing frontend release for $tagName"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$status = git status --porcelain
if (-not [string]::IsNullOrWhiteSpace($status)) {
  throw "Working tree is not clean. Commit or stash your changes before release."
}

npm --prefix frontend version $Version --no-git-tag-version

git add frontend/package.json frontend/package-lock.json

git commit -m "release(frontend): $tagName"

git tag -a $tagName -m "Frontend release $Version"

git push origin $Branch

git push origin $tagName

Write-Host "Release tag pushed: $tagName"
Write-Host "GitHub Actions workflow 'Frontend Build and Release' will build and publish the release artifact."
