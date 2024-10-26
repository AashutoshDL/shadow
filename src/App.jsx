import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PoseDetection from './PoseDetection/PoseDetection'
import VideoMask from './Mask/VideoMask'
import VideoMask2 from './Mask/VideoMask2'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  <VideoMask2 /> 
    </>
  )
}

export default App
