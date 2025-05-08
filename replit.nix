{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.yarn
    pkgs.lsof
  ];
  env = {
    REPLIT_NPM_PACKAGE_PATH = ".";
  };
}