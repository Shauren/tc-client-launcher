# TcLauncher

> [!IMPORTANT]  
> This tool requires the [Arctium Launcher](https://arctium.io/wow/) to work, If the current Arctium Launcher version doesn't have support to your current operating system, <ins>**this tool will not work**</ins>.

## Build

Run `npm run build-all-dev` to build the project. The build artifacts will be stored in the `dist/` directory.
Use the `npm run build-package:{OS}` for a production build (`win` or `mac`).

## VSCode debug configurations

Debug Main Process - debugging code found in src/electron

Debug Renderer Process - debugging code from src/app. First, start the application with `npm run electron` then attach with this configuration

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceRoot}",
      "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron.cmd"
      },
      "args": [
        "dist/"
      ]
    },
    {
      "name": "Debug Renderer Process",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "webRoot": "${workspaceRoot}"
    }
  ]
}
```
