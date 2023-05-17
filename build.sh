#!/bin/sh

rootFolder=$(dirname "$(realpath $0)")

rm -rf ${rootFolder}/src/Smusdi.Wasm/bin
rm -rf ${rootFolder}/src/Smusdi.Wasm/obj

dotnet publish ${rootFolder}/src/Smusdi.Wasm/Smusdi.Wasm.csproj --configuration Release

rm -rf ${rootFolder}/ui/src/assets/smusdi
mkdir -p ${rootFolder}/ui/src/assets/smusdi

cp -r ${rootFolder}/src/Smusdi.Wasm/bin/Release/net7.0/browser-wasm/AppBundle/* ${rootFolder}/ui/src/assets/smusdi/.