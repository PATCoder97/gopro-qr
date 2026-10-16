# Third-party notices

`src/vendor/controls.html`, `src/vendor/engine.js`, `public/vendor/icons3.png`,
`public/vendor/RearCamera.png` are adapted/copied from GoPro Labs:
https://github.com/gopro/labs and https://gopro.github.io/labs/control/custom/.
Retrieved 2026-10-16. Licensed under Apache License 2.0; a copy is in
`public/vendor/GOPRO-LICENSE.txt`.

Changes include a Vietnamese interface, responsive select controls, module isolation,
explicit refresh, state serialization, one click handler per target, keyboard controls,
and a corrected frame-rate mapping. Original GoPro command values are retained.

GoPro is a trademark of GoPro, Inc. This project is an independent tool.

QR generation uses `qrcode` (MIT), with its dependencies and their licenses
available in the npm package. No external QR service receives command contents.
