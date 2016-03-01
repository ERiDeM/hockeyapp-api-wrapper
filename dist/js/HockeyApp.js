/// <reference path="../typings/main/ambient/request/request.d.ts" />
/// <reference path="../typings/main/ambient/q/q.d.ts" />
'use strict';
var request = require('request');
var Q = require('q');
var HockeyApp = (function () {
    function HockeyApp(options) {
        if (typeof options === 'IOptions') {
            this.init(options);
        }
        else if (typeof options === 'string') {
            this.init({ hockeyAppToken: options });
        }
        else {
            throw ('"options" must be a "IOptions" or "string" object.');
        }
    }
    Object.defineProperty(HockeyApp, "BASE_URL", {
        get: function () { return 'https://rink.hockeyapp.net/api/2/'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HockeyApp, "GET_APPS_PATH", {
        get: function () { return 'apps'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HockeyApp, "GET_APP_VERSION_PATH", {
        get: function () { return 'apps/{public_identifier}/app_versions'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HockeyApp, "GET_ANDROID_APP_DOWNLOAD_PATH", {
        get: function () { return 'apps/{public_identifier}/app_versions/{id}?format=apk'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HockeyApp, "HOCKEY_APP_TOKEN_HEADER", {
        get: function () { return 'X-HockeyAppToken'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HockeyApp.prototype, "Options", {
        get: function () { return this._options; },
        set: function (value) { this._options = value; },
        enumerable: true,
        configurable: true
    });
    HockeyApp.prototype.init = function (options) {
        this.Options = options;
    };
    /**
     * Create request options for this API wrapper
     * @param urlPath API path
     * @param method GET by default
     */
    HockeyApp.prototype.createRequestOptions = function (urlPath, method) {
        method = method || 'GET';
        var requestOptions = {
            url: HockeyApp.BASE_URL + urlPath,
            method: method,
            headers: {}
        };
        requestOptions.headers[HockeyApp.HOCKEY_APP_TOKEN_HEADER] = this._options.hockeyAppToken;
        return requestOptions;
    };
    /**
     * Get all Apps
     * @returns http://support.hockeyapp.net/kb/api/api-apps#list-apps
     */
    HockeyApp.prototype.getApps = function () {
        var deferred = Q.defer();
        var options = this.createRequestOptions(HockeyApp.GET_APPS_PATH);
        request(options, function (error, response, body) {
            var json = JSON.parse(body);
            deferred.resolve(json);
        });
        return deferred.promise;
    };
    /**
     * Get all Versions of an app
     * @param app: Response from HockeyApp.prototype.getApps
     * @returns http://support.hockeyapp.net/kb/api/api-versions#list-versions
     */
    HockeyApp.prototype.getVersions = function (app) {
        var deferred = Q.defer();
        var public_identifier = app.public_identifier;
        var options = this.createRequestOptions(HockeyApp.GET_APP_VERSION_PATH.replace('{public_identifier}', public_identifier));
        request(options, function (error, response, body) {
            var json = JSON.parse(body);
            deferred.resolve(json);
        });
        return deferred.promise;
    };
    /**
     * Get latest version download link for Android app
     * @param app: Response from HockeyApp.prototype.getApps
     * @param version: Response from HockeyApp.prototype.getVersions
     * @returns Downloadable APK
     */
    HockeyApp.prototype.getLatestAndroidVersionDownloadLink = function (app, version) {
        var public_identifier = app.public_identifier;
        var id = version.id;
        var downloadUrl = HockeyApp.BASE_URL + HockeyApp.GET_ANDROID_APP_DOWNLOAD_PATH
            .replace('{public_identifier}', public_identifier)
            .replace("{id}", id);
        return downloadUrl;
    };
    ;
    return HockeyApp;
}());
module.exports = HockeyApp;
