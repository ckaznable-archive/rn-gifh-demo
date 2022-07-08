import React, { useState } from 'react'
import type { Node } from 'react'
import { SafeAreaView, Image } from 'react-native'
import HtmlImage from './script/HtmlImage'

const App: () => Node = () => {
  const [img, setImg] = useState("")
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const imageHtml = `
    <div style="display: flex; flex-direction: column; gap: 5px">
      <div style="background: green">First</div>
      <div style="background: red; color: white">Second</div>
      <div style="background: blue">Last</div>
    </div>
  `

  const onResponse = ({body, width, height}) => {
    setImg(body)
    setWidth(width)
    setHeight(height)
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "pink"}}>
      {img && <Image source={{uri: img}} style={{width, height}} />}
      <HtmlImage imageHtml={imageHtml} onResponse={onResponse} />
    </SafeAreaView>
  )
}

export default App
