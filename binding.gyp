{
  "targets": [
    {
      "target_name": "tc_launcher",
      "sources": [
        "src/native/Launcher.cpp"
      ],
      "conditions": [
        ["OS==\"win\"", {
          "sources": [
            "src/native/Win32Launcher.cpp"
          ],
          "defines": [
            "WIN32_LEAN_AND_MEAN"
          ],
          "libraries": [
            "crypt32.lib"
          ]
        }],
        ["OS==\"mac\"", {
          "sources": [
            "src/native/MacLauncher.cpp",
            "src/native/CDSACrypt.cpp",
            "src/native/CDSACrypt.h"
          ],
          "libraries": [
            'CoreFoundation.framework',
            'Security.framework'
          ],
          "xcode_settings": {
            "OTHER_CFLAGS": [
              "-std=c++14"
            ],
          }
        }]
      ]
    }
  ]
}
