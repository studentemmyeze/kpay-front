export class Utils {

  private static parseQueryString(str: string): Object {
      var ret: {[k: string]: string[] | string} = Object.create(null);

      if (typeof str !== 'string') {
        return ret;
      }

      str = str.trim().replace(/^(\?|#|&)/, '');

      if (!str) {
        return ret;
      }

      str.split('&').forEach(function (param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        // Firefox (pre 40) decodes `%3D` to `=`
        // https://github.com/sindresorhus/query-string/pull/37
        var key = parts.shift();
        var val = parts.length > 0 ? parts.join('=') : undefined;
        //@ts-ignore

        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
          //@ts-ignore

        val = val === undefined ? null : decodeURIComponent(val);

        var retVal = ret[key];
        if (ret[key] === undefined) {
            //@ts-ignore

          ret[key] = val;
        } else if (Array.isArray(retVal)) {
            //@ts-ignore

          retVal.push(val);
        } else {
            //@ts-ignore

          ret[key] = [<string> ret[key], val];
        }
      });

      return ret;
    }

// Parses the url and gets the access token if it is in the urls hash
public static getAccessTokenFromUrl(): string {
  //@ts-ignore
  return <string> Utils.parseQueryString(window.location.hash)['access_token'];
}

public static getAccountID(): string {
  //@ts-ignore
  return <string> Utils.parseQueryString(window.location.hash)['uid'];
}
}
