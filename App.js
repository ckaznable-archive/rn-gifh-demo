import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Node } from 'react'
import { SafeAreaView, View, Image, useWindowDimensions } from 'react-native'
import WebView from 'react-native-webview'

const App: () => Node = () => {
  const [img, setImg] = useState("")
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const el = useRef(null)
  const baseUrl = "."

  const getScript = (html) => {
    return `
      var canvas = document.getElementById('canvas');
      var ctx = canvas.getContext('2d');

      var data = '<svg xmlns="http://www.w3.org/2000/svg">' +
        '<foreignObject width="100%" height="100%">' +
        '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
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

  const imageHtml = `
    <div style="display: flex; flex-direction: column">
      <div style="background: green">First</div>
      <div style="background: red; color: white">Second</div>
      <div style="background: blue">Last</div>
    </div>
  `

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

  const onMessage = (data) => {
    if(data.nativeEvent.data === "ready") {
      el.current?.injectJavaScript(getScript(imageHtml))
      return
    }

    const {body, width, height} = JSON.parse(data.nativeEvent.data)
    setImg(body)
    setWidth(width)
    setHeight(height)
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      {img && <Image source={{uri: img}} style={{width, height}} />}

      <WebView
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
    </SafeAreaView>
  )
}

export default App
