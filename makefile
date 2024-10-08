# Determine the operating system
ifeq ($(OS),Windows_NT)
    OS_TYPE := Windows
else
    OS_TYPE := $(shell uname -s)
endif

# Define Gradle wrapper command based on the operating system
ifeq ($(OS_TYPE),Windows)
    SHELL_CMD := cmd /c
else
    SHELL_CMD := sh
endif

build:
	npm run build

generate-version:
ifeq ($(OS_TYPE),Windows)
	$(SHELL_CMD) ci\version\generate-version.bat
else
	$(SHELL_CMD) ci/version/generate-version.sh
endif

create-change-log:
ifeq ($(OS_TYPE),Windows)
	$(SHELL_CMD) ci\version\create-change-log.bat
else
	$(SHELL_CMD) ci/version/create-change-log.sh
endif