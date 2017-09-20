{
  "targets": [
    {
      "target_name": "tc_launcher",
      "sources": [ "src/native/Launcher.cpp" ],
      "msvs_settings": {
	      "VCLinkerTool": {
	        "AdditionalDependencies": [
	          "Crypt32.lib"
	        ]
	      }
      }
    }
  ]
}
