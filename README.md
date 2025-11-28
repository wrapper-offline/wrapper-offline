<div class="head" align="center">
  <h1>Wrapper: Offline</h1>
  <p><b>This project is not affiliated with or endorsed by GoAnimate Inc., or their product, Vyond. Wrapper: Offline is a decentralized, open-source initiative developed exclusively for archival purposes. It operates on a non-profit basis and does not accept any form of donations.</b></p>
  <br/>
</div>

Wrapper: Offline is a program designed to provide readily obtainable, irrevocable access to GoAnimate's retired assets in the modern era. It achieves this by replicating the original API and asset servers entirely on the user's computer while providing a simplistic frontend to interact with them. This project is important for archival purposes, as the ability to use the legacy GoAnimate editor and themes would be far trickier without it.

## Downloads / Installation
To run Wrapper: Offline, you must first download the [latest release](https://github.com/wrapper-offline/wrapper-offline/releases/tag/v2.0.1). The installation process is pretty straightforward; you extract the archive and run the executable inside.

## Updates & Support
For support, the first thing you should do is to [read through our wiki](https://github.com/wrapper-offline/wrapper-offline/wiki), as it most likely has what you want to know. Alternatively, if you can't find what you need, you can join the [Discord server](https://discord.gg/Kf7BzSw). Joining the server is recommended, as there is a whole community that can help you out.

## Development
To run Offline with a development server, run the following under the root folder of Offline:
```
npm run dev
```

### Previewing
To run Offline without starting a development server:
```
npm run preview
```

### Packaging
To build a full copy of Offline:
```
npm run package
```
*You will need to copy the `resources` folder manually. It needs to go in the resources folder of the build.*

## License
Most of this project is free/libre software[1] under the MIT license. You have the freedom to run, change, and share this as much as you want.
FFmpeg is under the GNU GPLv2 license, which grants similar rights, but has some differences from MIT. Flash Player (`resources/plugins`) and GoAnimate's original assets (`resources/static`) are proprietary and do not grant you these rights, but if they did, this project wouldn't need to exist.

## Credits
These are unaffiliated people that they haven't directly done anything for the project but still deserve credit for their things. Kinda like a shoutout but in a project's readme. ***Please do not contact them about Wrapper: Offline.***

Name | Contribution
---- | ----
[Vyond](https://vyond.com) | Creators of the themes we love
[VisualPlugin](https://github.com/Windows81) | GoAnimate Wrapper, character dump
[It'sJay](https://github.com/PoleyMagik) | Asset store archive, client modifications

No members of the original GoAnimate Wrapper team are officially working on Offline, even if they have contributed. Some members of the original team have asked to not be given credit, and they have been removed.

## Footnotes
[1] - See <https://www.gnu.org/philosophy/free-sw.html> for a better definition of free software.
