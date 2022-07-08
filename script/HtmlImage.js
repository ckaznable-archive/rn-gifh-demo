import React, { useRef } from 'react'
import { useWindowDimensions } from 'react-native'
import WebView from 'react-native-webview'
import useNoInitialEffect from './hook/useNoInitialEffect'

function getScript(html, height, width) {
  return `
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.canvas.height = ${height}
    ctx.canvas.width = ${width}

    var data = '<svg xmlns="http://www.w3.org/2000/svg">' +
      '<foreignObject width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml">' +
      '${html.replace(/\n/g, "")}' +
      '</div>' +
      '</foreignObject>' +
      '</svg>';

    var img = new Image();
    img.setAttribute('crossOrigin', 'Anonymous')
    var url = "data:image/svg+xml;base64," + window.btoa(data)

    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        body: canvas.toDataURL(),
        height: canvas.height,
        width: canvas.width
      }))
    }

    img.src = url
  `
}

function HtmlImage({imageHtml, onResponse}) {
  const el = useRef(null)
  const { height, width } = useWindowDimensions()

  const baseUrl = "."
  const html = `
    <html>
      <head>
        <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scaleable=no' name='viewport'>
      </head>
      <body>
        <canvas id="canvas"></canvas>
      </body>

      <script>
        window.ReactNativeWebView.postMessage("ready")
      </script>
    </html>
  `

  const inject = () => {
    el.current?.injectJavaScript(getScript(imageHtml, height, width))
  }

  const onMessage = (data) => {
    if(data.nativeEvent.data === "ready") {
      return inject()
    }

    onResponse(JSON.parse(data.nativeEvent.data))
  }

  useNoInitialEffect(inject, [imageHtml])

  return <WebView
    ref={el}
    onMessage={onMessage}
    style={{display: "none"}}
    originWhitelist={['*']}
    source={{html, baseUrl}}
    mixedContentMode="always"
    allowFileAccess={true}
    allowUniversalAccessFromFileURLs={true}
    javaScriptEnabled
    domStorageEnabled
    thirdPartyCookiesEnabled
    allowUniversalAccessFromFileURLs
  />
}

export default React.memo(HtmlImage)