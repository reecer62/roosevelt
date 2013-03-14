/**
 * Roosevelt MVC web framework
 * @author Eric Newport (kethinov)
 * @license Creative Commons Attribution 3.0 Unported License http://creativecommons.org/licenses/by/3.0/deed.en_US
 */

/*! @source https://github.com/kethinov/roosevelt */
/*jshint camelcase: true, curly: true, eqeqeq: false, forin: false, strict: false, trailing: true, evil: true, devel: true, node: true */

// constructor
var roosevelt = function(params) {

  // define empty params object if no params are passed
  params = params ? params : {};

  // require dependencies
  var fs = require('fs'),           // utility library for filesystem access
      http = require('http'),       // node's http server
      express = require('express'), // express http server
      app = express(),              // initialize express
      teddy = require('teddy'),     // teddy templating engine

      // configure express
      expressConfig = function() {

        // declare variables
        var appdir,           // directory the main module is located in
            viewsPath,        // where the views are located
            controllersPath,  // where the controllers are located
            controllerFiles,  // list of controllers files
            i,                // temp var for looping
            staticFolder,     // temp var for statics iterating
            controllerName,   // temp var for controller iterating
            controllerMethod, // temp var for controller iterating
            controllers = []; // controller methods to be stored here

        // gets full path of mainModule
        appdir = process.mainModule.filename.replace(process.mainModule.filename.split('/')[process.mainModule.filename.split('/').length - 1], '');

        // windows support
    		if (!appdir) {
    			appdir = process.mainModule.filename.replace(process.mainModule.filename.split('\\')[process.mainModule.filename.split('\\').length - 1], '');
    		}

        // where the models are located
        modelsPath = params.modelsPath ? appdir + params.modelsPath : appdir + 'mvc/models/';
        roosevelt.modelsPath = modelsPath;

        // where the views are located
        viewsPath = params.viewsPath ? appdir + params.viewsPath : appdir + 'mvc/views/';

        // where the controllers are located
        controllersPath = params.controllersPath ? appdir + params.controllersPath : appdir + 'mvc/controllers/';

        // build list of controller files
        try {
          controllerFiles = fs.readdirSync(controllersPath);
        }
        catch (e) {
          console.log("\nRoosevelt fatal error: could not load controller files from " + controllersPath + "\n");
          console.log(e);
        }

        // set port
        app.set('port', params.port || process.env.NODE_PORT || 43711);
      
        // set templating engine
        app.set('views', viewsPath);
        app.engine('html', teddy.__express);
      
        // dumps http requests to the console
        app.use(express.logger());
      
        // defines req.body by parsing http requests
        app.use(express.bodyParser());
      
        // map statics
        if (!params.statics) {
          app.use('/i', express.static((params.imagesPath ? appdir + params.imagesPath : appdir + 'statics/i/')));
          app.use('/css', express.static((params.cssPath ? appdir + params.cssPath : appdir + 'statics/css/')));
          app.use('/js', express.static((params.jsPath ? appdir + params.jsPath : appdir + 'statics/js/')));
        }
        else {
          for (i in params.statics) {
            staticFolder = params.statics[i];
            app.use('/' + i, express.static(appdir + staticFolder));
          }
        }
      
        // load all controllers
        for (i in controllerFiles) {
          controllerName = controllerFiles[i];
          
          // strip .js
          controllerName = controllerName.substring(0, controllerName.length - 3);
        
          // map routes
          controllers[controllerName] = require(controllersPath + controllerName);
          controllerMethod = controllers[controllerName];
          app.use('/' + controllerName, controllerMethod);
          app.use('/' + controllerName + '/*', controllerMethod);
        }
      
        // map index, 404 routes
        app.use('/', controllers.index);
        app.use('*', controllers._404);
        
        if (params.customConfigs && typeof params.customConfigs === 'function') {
          params.customConfigs();
        }
      },
      
      startServer = function() {
        console.log((params.name ? params.name : 'Roosevelt Express') + ' server listening on port ' + app.get('port') + ' (' + app.get('env') + ' mode)');
      };

  // configure express and start server
  app.configure(expressConfig);
  app.listen(app.get('port'), startServer);
};

// flushes require cache and loads a model
roosevelt.loadModel = function(model) {
  delete require.cache[require.resolve(roosevelt.modelsPath + model)];
  return require(roosevelt.modelsPath + model);
};

module.exports = roosevelt;