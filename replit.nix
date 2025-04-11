{pkgs}: {
  deps = [
    pkgs.wget
    pkgs.libxcrypt
    pkgs.glibcLocales
    pkgs.xcbuild
    pkgs.swig
    pkgs.openjpeg
    pkgs.mupdf
    pkgs.libjpeg_turbo
    pkgs.jbig2dec
    pkgs.harfbuzz
    pkgs.gumbo
    pkgs.freetype
    pkgs.postgresql
  ];
}
