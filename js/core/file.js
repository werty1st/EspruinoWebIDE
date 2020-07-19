/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  File Load/Save
 ------------------------------------------------------------------
**/
"use strict";
(function(){

  var currentJSFileName = "code.js";
  var currentXMLFileName = "code_blocks.xml";
  var loadFileCallback;

  const MIMETYPE_JS = ".js,.txt,application/javascript,text/plain";
  const MIMETYPE_XML = ".xml,text/xml";

  function init() {
    // Configuration


    // Add stuff we need
    Espruino.Core.App.addIcon({
      id: "openFile",
      icon: "folder-open",
      title : "Open File",
      order: 100,
      area: {
        name: "code",
        position: "top"
      },
      click: function() {
        if (Espruino.Core.Code.isInBlockly())
          loadFile(Espruino.Core.EditorBlockly.setXML, currentXMLFileName, MIMETYPE_XML);
        else
          loadFile(Espruino.Core.EditorJavaScript.setCode, currentJSFileName, MIMETYPE_JS);
      }
    });

    Espruino.Core.App.addIcon({
      id: "saveFile",
      icon: "save",
      title : "Save File",
      order: 200,
      area: {
        name: "code",
        position: "top"
      },
      click: function() {
        if (Espruino.Core.Code.isInBlockly())
          Espruino.Core.Utils.fileSaveDialog(convertToOS(Espruino.Core.EditorBlockly.getXML()), currentXMLFileName, setCurrentFileName);
        else
          Espruino.Core.Utils.fileSaveDialog(convertToOS(Espruino.Core.EditorJavaScript.getCode()), currentJSFileName, setCurrentFileName);
      }
    });
  }

  function setCurrentFileName(filename) {
    if (Espruino.Core.Code.isInBlockly()) {
      currentXMLFileName = filename;
    } else {
      currentJSFileName = filename;
    }
  }

  /**  Handle newline conversions - Windows expects newlines as /r/n when we're saving/loading files */
  function convertFromOS(chars) {
   if (!Espruino.Core.Utils.isWindows()) return chars;
   return chars.replace(/\r\n/g,"\n");
  };

  /**  Handle newline conversions - Windows expects newlines as /r/n when we're saving/loading files */
  function convertToOS(chars) {
   if (!Espruino.Core.Utils.isWindows()) return chars;
   return chars.replace(/\r\n/g,"\n").replace(/\n/g,"\r\n");
  };

  function loadFile(callback, filename, mimeType) {
    if (chrome.fileSystem) {
      // Chrome Web App / NW.js
      chrome.fileSystem.chooseEntry({type: 'openFile', suggestedName:filename}, function(fileEntry) {
        if (!fileEntry) return;
        if (fileEntry.name) setCurrentFileName(fileEntry.name);
        fileEntry.file(function(file) {
          var reader = new FileReader();
          reader.onload = function(e) {
            callback(convertFromOS(e.target.result));
          };
          reader.onerror = function() {
            Espruino.Core.Notifications.error("Error Loading", true);
          };
          reader.readAsText(file);
        });
      });
    } else {
      Espruino.Core.Utils.fileOpenDialog({id:"code",type:"text",mimeType:mimeType}, function(data, mimeType, fileName) {
        if (fileName) setCurrentFileName(fileName);
        callback(convertFromOS(data));
      });
    }
  }


  Espruino.Core.File = {
    init : init
  };
}());
