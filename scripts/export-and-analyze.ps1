param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Arguments
)

$scriptPath = Join-Path $PSScriptRoot "..\packages\ts-analyzer\scripts\export-and-analyze.js"
& node $scriptPath @Arguments
exit $LASTEXITCODE
