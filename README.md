# Magnifique

[![Build App](https://github.com/7086cmd/magnifique/actions/workflows/auto-build.yml/badge.svg?branch=main)](https://github.com/7086cmd/magnifique/actions/workflows/auto-build.yml)
[![CodeQL](https://github.com/7086cmd/magnifique/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/7086cmd/magnifique/actions/workflows/codeql-analysis.yml)
[![Auto Tests](https://github.com/7086cmd/magnifique/actions/workflows/auto-unit-test.yml/badge.svg)](https://github.com/7086cmd/magnifique/actions/workflows/auto-unit-test.yml)

It is a repo for a great platform we use. Here, you can see what you can do to use this app.

1. Prepare a server runned `Windows 11` or `Windows Server 2022`. This app must have the latest system due to run `electron 17`
2. Keep 8GB RAM and 16GB SSD. The database is in `${os.tmpdir()}/../magnifique`, and you must have storage to save the data.
3. Prepare a domain, and get the `SSL` cert to enfore `https`. The domain should arrow to your ip.
4. Save `SSL` cert to `${os.tmpdir()}/../magnifique/ssl/`, including `key` file and `pem` file.
5. Be a sponsor and install the app from `GitHub`
6. Wait for complete, and run it.
7. It will show your ip and you can visit it in `LAN` via domain(`https`)
