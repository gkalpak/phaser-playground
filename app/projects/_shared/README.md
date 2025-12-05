# The `_shared/` directory

This directory contains files that are useful across projects.
It contains two sub-directories: `scripts/` and `vendor/`


## The `scripts/` sub-directory

This sub-directory contains re-usable, proprietary source-code files. 


### Adding a new file

- Create a new directory with the module's name and version.
- Add the source-code in an `index.<ext>` file inside the new directory.
- Add a new export in `_shared/scripts/index.js`.
- Add a new entry in `_shared/scripts/sw-utils@<version>/index.js` (typically in `cacheFirst.files`).
- Increment the version of `sw-utils` (and update the `sw.js` files in all projects).


### Updating an existing file

- Update the source-code in the corresponding `index.<ext>` file.
- Increment the version in the corresponding sub-directory.
- Update the corresponding entry in `_shared/scripts/index.js`.
- Update the corresponding entry in `_shared/scripts/sw-utils@<version>/index.js`.
- Increment the version of `sw-utils` (and update the `sw.js` files in all projects).


## The `vendor/` sub-directory

This sub-directory contains 3rd-party source code, typically included into an app via `<script>` tags in `index.html`.


### Adding a new file

- Create a new directory with the library's name and version.
- Add the source-code in an `index.<ext>` file inside the new directory.
- Add a new entry in `_shared/scripts/sw-utils@<version>/index.js` (typically in `cacheFirst.files`).
- Increment the version of `sw-utils` (and update the `sw.js` files in all projects).


### Updating an existing file

- Update the source-code in the corresponding `index.<ext>` file.
- Increment the version in the corresponding sub-directory.
- Update the corresponding `<script>` tag in the `index.html` files in all projects.
- Update the corresponding entry in `_shared/scripts/sw-utils@<version>/index.js`.
- Increment the version of `sw-utils` (and update the `sw.js` files in all projects).
