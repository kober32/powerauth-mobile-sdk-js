// Dependencies
const gulp = require("gulp"); // gulp itself
const rename = require('gulp-rename'); // file rename
const ts = require("gulp-typescript"); // to be able to compiles typescript
const footer = require("gulp-footer"); // file appender
const stripImportExport = require("gulp-strip-import-export"); // import/export removal to be able to compile into single file js
const { rimraf } = require('rimraf'); // folder cleaner
const fs = require('fs');


// Out files
const buildDir = "build";
const capacitorOutDir = "lib";
const cordovaOutDir = "cordova";
const cordovaOutFile = "powerauth.js";

/***********************
 * REACT-NATIVE SECTION
 ***********************/

{
    const RN_packageJson = "package.json";
    const RN_tsConfig = "tsconfig.json";
    const RN_buildDir = `${buildDir}/react-native`;
    const RN_sources = "src/**/**.ts";

    const clearRN = () => rimraf([ RN_buildDir ]);

    const compileRNTask = () =>
        gulp
            .src(RN_sources)
            .pipe(ts(RN_tsConfig))
            .pipe(gulp.dest(RN_buildDir + "/lib"));

    const copyRNFiles = () =>
        gulp
            .src(JSON.parse(fs.readFileSync(RN_packageJson, 'utf8')).files.filter((file) => !file.startsWith("lib/")), { base: "." })
            .pipe(gulp.dest(RN_buildDir));

    const copyRNPackage = () => 
        gulp
            .src(RN_packageJson)
            .pipe(gulp.dest(RN_buildDir));

    var RN_buildTask = gulp.series(clearRN, compileRNTask, copyRNFiles, copyRNPackage);
}

/***********************
 * CAPACITOR.JS SECTION
 ***********************/

{
    const CAP_packageJson = "cordova-support/package-capacitor.json";
    const CAP_tsConfig = "cordova-support/tsconfig-capacitor.json";
    const CAP_buildDir = `${buildDir}/capjs`;
    const CAP_sources = "src/**/**.ts";

    const clearCAP = () => rimraf([ CAP_buildDir ]);

    const compileCAPTask = () =>
        gulp
            .src(CAP_sources)
            .pipe(ts(CAP_tsConfig))
            .pipe(gulp.dest(CAP_buildDir + "/lib"));

    const copyCAPFiles = () =>
        gulp
            .src(JSON.parse(fs.readFileSync(CAP_packageJson, 'utf8')).files.filter((file) => !file.startsWith("lib/")), { base: "." })
            .pipe(gulp.dest(CAP_buildDir));

    const copyCAPPackage = () => 
        gulp
            .src(CAP_packageJson)
            .pipe(rename("package.json"))
            .pipe(gulp.dest(CAP_buildDir));

    var CAP_buildTask = gulp.series(clearCAP, compileCAPTask, copyCAPFiles, copyCAPPackage);
}

/***********************
 * CORDOVA.JS SECTION
 ***********************/

{
    const compileCordovaTask = () =>
        gulp
            .src([ "src/PowerAuth*.ts", "src/*/*.ts" ])
            .pipe(stripImportExport())
            .pipe(ts("tsconfig-cordova.json"))
            .pipe(gulp.dest(cordovaOutDir));

    // Append module export needed for cordova to export the plugin
    const exportCordovaModuleTask = () =>
        gulp
            .src(`${cordovaOutDir}/${cordovaOutFile}`)
            .pipe(footer("module.exports = PowerAuthPlugin;"))
            .pipe(gulp.dest(cordovaOutDir));

    // join cordova compile and modify for export task
    var CDV_buildTask = gulp.series(compileCordovaTask, exportCordovaModuleTask);
}

let cleanAll = () => rimraf([ buildDir ])

// first, delete output folders, then compile cordova and capacitor in parallel
const buildAllTask = gulp.series(
    cleanAll,
    gulp.parallel(
        RN_buildTask,
        CAP_buildTask,
        // CDV_buildTask
    )
);

// watch and default task
gulp.task("watch", () => { gulp.watch("src/ts/**/*.ts", buildAllTask) });
gulp.task("default", buildAllTask);
gulp.task("rn", RN_buildTask);
gulp.task("cap", CAP_buildTask);
gulp.task("cdv", CDV_buildTask);
