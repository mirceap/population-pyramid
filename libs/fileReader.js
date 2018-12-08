"use strict";

var exports = module.exports = {};

exports.getAsText = (readFile, loadedCb, errorCb) => {

    var reader = new FileReader();
    // Read file into memory as UTF-8
    reader.readAsText(readFile, "UTF-8");

    // Handle progress, success, and errors
    reader.onprogress = updateProgress;
    reader.onload = loaded;
    reader.onerror = errorHandler;


    function updateProgress(evt) {
        if (evt.lengthComputable) {
            // evt.loaded and evt.total are ProgressEvent properties
            var loaded = (evt.loaded / evt.total);
            if (loaded < 1) {
            // Increase the prog bar length
            // style.width = (loaded * 200) + "px";
            }
        }
    }

    function loaded(evt) {
        // Obtain the read file data
        var fileString = evt.target.result;
        if (fileString == undefined){
            reader.error = "Error when loading the file into memory."
            return;
        }
        loadedCb(fileString);
    }

    function errorHandler(evt) {
        if(evt.target.error.name == "NotReadableError") {
            // The file could not be read
            errorCb("NotReadeableError on" + this.readFile);
        }
    }
};